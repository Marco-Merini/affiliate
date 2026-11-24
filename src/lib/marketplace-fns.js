import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { DEFAULT_BASE_URL, slugify } from "@/lib/seo";

const MISSING_CREDENTIALS =
  "As credenciais do Mercado Livre ainda não foram configuradas. Adicione MERCADO_LIVRE_CLIENT_ID e MERCADO_LIVRE_CLIENT_SECRET na página Secrets do painel.";

const loadMl = () => import("@/lib/mercadolivre.server");

const upgradeThumb = (url) => {
  if (!url) return null;
  return String(url)
    .replace(/^http:/i, "https://")
    .replace(/-I\.(jpg|jpeg|png|webp)$/i, "-O.$1");
};

const mapResult = (item) => ({
  external_id: item.id,
  name: item.title,
  price: Number(item.price) || null,
  original_price: Number(item.original_price) || null,
  image_url: upgradeThumb(item.thumbnail),
  permalink: item.permalink,
  sold_quantity: Number(item.sold_quantity) || 0,
  condition: item.condition ?? null,
});

export const getMercadoLivreStatus = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({}))
  .handler(async ({ context }) => {
    const { mlCredentials, readConnection } = await loadMl();
    const db = context.getBase44().asServiceRole;
    const [connection, categoriesPage] = await Promise.all([
      mlCredentials() ? readConnection(db).catch(() => null) : Promise.resolve(null),
      db.entities.Category.filter({ is_active: true }, { sort: "name", limit: 60 }),
    ]);

    return {
      configured: Boolean(mlCredentials()),
      connected: Boolean(connection?.refresh_token),
      nickname: connection?.nickname ?? null,
      expires_at: connection?.expires_at ?? null,
      categories: (categoriesPage?.items ?? []).map((category) => ({
        id: category.id,
        name: category.name,
      })),
    };
  });

export const getMercadoLivreAuthUrl = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({}))
  .handler(async () => {
    const { mlCredentials, buildAuthUrl } = await loadMl();
    const credentials = mlCredentials();
    if (!credentials) throw new Error(MISSING_CREDENTIALS);
    return { url: buildAuthUrl(credentials, `${DEFAULT_BASE_URL}/api/mercadolivre/callback`) };
  });

export const disconnectMercadoLivre = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({}))
  .handler(async ({ context }) => {
    await context
      .getBase44()
      .asServiceRole.entities.MarketplaceConnection.deleteMany({ platform: "mercado_livre" });
    return { ok: true };
  });

export const searchMercadoLivreProducts = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ query: z.string().trim().min(2).max(80) }))
  .handler(async ({ data, context }) => {
    const { mlCredentials, getAccessToken, mlGet } = await loadMl();
    if (!mlCredentials()) throw new Error(MISSING_CREDENTIALS);

    const auth = await getAccessToken(context.getBase44().asServiceRole).catch(() => null);
    if (auth?.error === "not_connected") {
      throw new Error("Conecte sua conta do Mercado Livre antes de buscar produtos.");
    }
    if (!auth?.token) {
      throw new Error("Sua conexão com o Mercado Livre expirou. Conecte a conta novamente.");
    }

    const result = await mlGet(
      auth.token,
      `/sites/MLB/search?q=${encodeURIComponent(data.query)}&limit=24`,
    );

    return { items: (result?.results ?? []).map(mapResult) };
  });

const uniqueSlug = async (db, name) => {
  const base = slugify(name) || "produto";
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`;
    const existing = await db.entities.Product.filter({ slug: candidate }, { limit: 1 });
    if (!(existing?.items ?? []).length) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
};

const importItem = {
  external_id: z.string().min(1).max(40),
  name: z.string().min(1).max(200),
  price: z.number().min(0).nullable().optional(),
  original_price: z.number().min(0).nullable().optional(),
  image_url: z.string().max(1200).nullable().optional(),
  permalink: z.string().min(8).max(1500),
};

export const importMercadoLivreProducts = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      category_id: z.string().max(64).nullable().optional(),
      items: z.array(z.object(importItem)).min(1).max(12),
    }),
  )
  .handler(async ({ data, context }) => {
    const { mlCredentials, getAccessToken, mlGet } = await loadMl();
    const db = context.getBase44();

    let program = (await db.entities.AffiliateProgram.filter(
      { platform: "mercado_livre" },
      { limit: 1 },
    ))?.items?.[0];

    if (!program) {
      program = await db.entities.AffiliateProgram.create({
        name: "Mercado Livre",
        platform: "mercado_livre",
        website_url: "https://www.mercadolivre.com.br",
        is_active: true,
        notes: "Criado automaticamente pela importação do Mercado Livre.",
      });
    }

    const auth = mlCredentials()
      ? await getAccessToken(context.getBase44().asServiceRole).catch(() => null)
      : null;

    const existing = await db.entities.Product.filter(
      { external_id: { $in: data.items.map((item) => item.external_id) } },
      { limit: 50 },
    );
    const known = new Set((existing?.items ?? []).map((product) => product.external_id));

    let imported = 0;
    let skipped = 0;

    for (const item of data.items) {
      if (known.has(item.external_id)) {
        skipped += 1;
        continue;
      }

      const detail = auth?.token
        ? await mlGet(auth.token, `/items/${item.external_id}/description`).catch(() => null)
        : null;
      const description = detail?.plain_text ? String(detail.plain_text).slice(0, 4000) : null;

      const product = await db.entities.Product.create({
        name: item.name.slice(0, 160),
        slug: await uniqueSlug(db, item.name),
        description,
        type: "physical",
        status: "active",
        external_id: item.external_id,
        category_id: data.category_id ?? null,
        program_id: program.id,
        image_url: item.image_url ?? null,
        current_price: item.price ?? null,
        previous_price: item.original_price ?? null,
        affiliate_url: item.permalink,
        price_checked_at: new Date().toISOString(),
      });

      await db.entities.AffiliateLink.create({
        product_id: product.id,
        program_id: program.id,
        url: item.permalink,
        label: "Mercado Livre",
        is_primary: true,
        is_active: true,
      });

      imported += 1;
    }

    await db.entities.ActivityLog.create({
      action: "product.imported",
      description: `Importação do Mercado Livre: ${imported} produto(s) publicado(s)`,
      entity_type: "Product",
      details: skipped ? `${skipped} produto(s) já existiam e foram ignorados.` : null,
    }).catch(() => null);

    return { imported, skipped };
  });