import { createFileRoute } from "@tanstack/react-router";
import { requireUserRoute } from "@/lib/auth-middleware";
import { parseMlList } from "@/lib/ml-list.server";
import { slugify } from "@/lib/seo";

// Lista pública de afiliados do Mercado Livre: fonte dos produtos da vitrine.
const LIST_URL = "https://meli.la/1zyyh7z";

const RULES = [
  ["Saúde e Bem-Estar", ["creatina", "pré treino", "pre treino", "whey", "suplemento", "vitamina", "colágeno", "termogênico"]],
  ["Beleza", ["óleo", "shampoo", "creme", "maquiagem", "perfume", "sérum", "hidratante", "condicionador", "máscara capilar"]],
  ["Esportes", ["corrida", "academia", "bicicleta", "musculação", "fitness", "bola", "halter"]],
  ["Moda", ["tênis", "camiseta", "bermuda", "short", "calça", "cueca", "meia", "vestido", "blusa", "jaqueta", "boné", "sandália", "sapato", "bolsa", "pijama"]],
  ["Tecnologia", ["iphone", "celular", "smartphone", "notebook", "tablet", "smartwatch", "monitor", "ssd", "processador", "câmera", "fone", "teclado", "mouse"]],
  ["Eletrônicos", ["tv", "soundbar", "caixa de som", "projetor", "headset", "carregador"]],
  ["Casa e Decoração", ["parafusadeira", "furadeira", "air fryer", "panela", "aspirador", "lâmpada", "ar condicionado", "cama", "mesa", "cadeira", "jogo de lençol"]],
];

const guessCategory = (name, byName) => {
  const value = String(name ?? "").toLowerCase();
  for (const [category, keywords] of RULES) {
    if (byName[category] && keywords.some((keyword) => value.includes(keyword))) {
      return byName[category];
    }
  }
  return byName.Outros ?? null;
};

export const Route = createFileRoute("/api/sync/ofertas")({
  server: {
    middleware: [requireUserRoute],
    handlers: {
      POST: async ({ context }) => {
        if (context.user.role !== "admin") {
          return Response.json({ error: "Apenas administradores." }, { status: 403 });
        }

        const response = await fetch(LIST_URL, {
          redirect: "follow",
          headers: {
            "user-agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
          },
        }).catch(() => null);

        if (!response || !response.ok) {
          return Response.json(
            { ok: false, error: `A lista respondeu ${response ? response.status : "sem resposta"}.` },
            { status: 502 },
          );
        }

        const items = parseMlList(await response.text());
        if (!items.length) {
          return Response.json({ ok: false, error: "Nenhum produto encontrado na lista." }, { status: 502 });
        }

        const db = context.getBase44().asServiceRole;
        const [programPage, categoryPage, productPage] = await Promise.all([
          db.entities.AffiliateProgram.filter({ platform: "mercado_livre" }, { limit: 1 }),
          db.entities.Category.list({ limit: 100 }),
          db.entities.Product.list({ limit: 300 }),
        ]);

        const program = programPage?.items?.[0] ?? null;
        const byName = Object.fromEntries((categoryPage?.items ?? []).map((row) => [row.name, row.id]));
        const products = productPage?.items ?? [];
        const byExternal = new Map(
          products.filter((row) => row.external_id).map((row) => [row.external_id, row]),
        );
        const byNameProduct = new Map(products.map((row) => [row.name.toLowerCase(), row]));
        const slugs = new Set(products.map((row) => row.slug).filter(Boolean));
        const now = new Date().toISOString();
        let updated = 0;
        let created = 0;

        for (const item of items) {
          const existing =
            (item.external_id ? byExternal.get(item.external_id) : null) ??
            byNameProduct.get(item.name.toLowerCase());

          if (existing) {
            const patch = { price_checked_at: now, affiliate_url: item.url };
            if (item.current_price !== null) patch.current_price = item.current_price;
            if (item.previous_price !== null) patch.previous_price = item.previous_price;
            if (item.rating !== null) patch.rating = item.rating;
            if (item.review_count !== null) patch.review_count = item.review_count;
            if (item.image) patch.image_url = item.image;
            if (!existing.external_id && item.external_id) patch.external_id = item.external_id;
            await db.entities.Product.update(existing.id, patch);
            updated += 1;
            continue;
          }

          const base = slugify(item.name) || "oferta";
          let slug = base;
          let suffix = 2;
          while (slugs.has(slug)) slug = `${base}-${suffix++}`;
          slugs.add(slug);

          const product = await db.entities.Product.create({
            name: item.name,
            slug,
            external_id: item.external_id,
            description: item.seller
              ? `${item.name}. Vendido por ${item.seller} no Mercado Livre.`
              : item.name,
            type: "physical",
            status: "active",
            category_id: guessCategory(item.name, byName),
            program_id: program?.id ?? null,
            image_url: item.image,
            current_price: item.current_price,
            previous_price: item.previous_price,
            rating: item.rating,
            review_count: item.review_count,
            affiliate_url: item.url,
            price_checked_at: now,
          });

          await db.entities.AffiliateLink.create({
            product_id: product.id,
            program_id: program?.id ?? null,
            url: item.url,
            label: "Link principal",
            is_primary: true,
            is_active: true,
          });
          created += 1;
        }

        await db.entities.ActivityLog.create({
          action: "products.synced",
          description: `Vitrine sincronizada: ${updated} produto(s) atualizado(s), ${created} novo(s).`,
          entity_type: "Product",
        }).catch(() => null);

        return Response.json({ ok: true, total: items.length, updated, created });
      },
    },
  },
});