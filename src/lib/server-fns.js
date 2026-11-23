import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { computeOpportunityScore } from "@/lib/opportunity";

const DAY_MS = 86400000;

const startOfUtcDay = (date) => {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
};

export const getDashboardOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({}))
  .handler(async ({ context }) => {
    const db = context.getBase44();
    const todayStart = startOfUtcDay(new Date());
    const todayEnd = new Date(todayStart.getTime() + DAY_MS);
    const since = new Date(todayStart.getTime() - 13 * DAY_MS);

    const [
      activeProducts,
      activeCampaigns,
      pendingApproval,
      approved,
      scheduled,
      published,
      failed,
      clicks,
      statusGroups,
      clickBuckets,
      todayPending,
      todayPublished,
      activityPage,
      queuePage,
    ] = await Promise.all([
      db.entities.Product.count({ status: "active" }),
      db.entities.Campaign.count({ status: "active" }),
      db.entities.Post.count({ status: "pending_approval" }),
      db.entities.Post.count({ status: "approved" }),
      db.entities.ScheduledPost.count({ status: "pending" }),
      db.entities.Post.count({ status: "published" }),
      db.entities.Post.count({ status: "failed" }),
      db.entities.ClickEvent.count({}),
      db.entities.Post.aggregate({ groupBy: "status" }),
      db.entities.ClickEvent.aggregate({
        query: { created_date: { $gte: since.toISOString() } },
        dateBucket: { field: "created_date", unit: "day" },
      }),
      db.entities.ScheduledPost.count({
        scheduled_for: { $gte: todayStart.toISOString(), $lt: todayEnd.toISOString() },
        status: "pending",
      }),
      db.entities.ScheduledPost.count({
        scheduled_for: { $gte: todayStart.toISOString(), $lt: todayEnd.toISOString() },
        status: "published",
      }),
      db.entities.ActivityLog.list({ sort: "-created_date", limit: 6 }),
      db.entities.Post.filter(
        { status: "pending_approval" },
        { sort: "-created_date", limit: 4 },
      ),
    ]);

    const bucketMap = new Map(
      (clickBuckets?.rows ?? []).map((row) => [String(row.created_date).slice(0, 10), row.count]),
    );
    const clicksLast14 = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(since.getTime() + index * DAY_MS).toISOString().slice(0, 10);
      return { date, count: bucketMap.get(date) ?? 0 };
    });

    return {
      counts: {
        activeProducts,
        activeCampaigns,
        pendingApproval,
        approved,
        scheduled: scheduled + approved,
        published,
        failed,
        clicks,
      },
      postsByStatus: (statusGroups?.rows ?? []).map((row) => ({
        status: row.status,
        count: row.count,
      })),
      clicksLast14,
      todayCount: todayPending + todayPublished,
      todaySlots: [],
      approvalQueue: (queuePage?.items ?? []).map((post) => ({
        id: post.id,
        title: post.title,
        platform: post.platform,
        created_date: post.created_date,
      })),
      activity: (activityPage?.items ?? []).map((entry) => ({
        id: entry.id,
        description: entry.description,
        created_date: entry.created_date,
      })),
    };
  });

const logActivity = (db, action, description, entityType, entityId) =>
  db.entities.ActivityLog.create({
    action,
    description,
    entity_type: entityType,
    entity_id: entityId,
  }).catch(() => null);

const productFields = {
  name: z.string().min(1).max(160),
  description: z.string().max(4000).nullable().optional(),
  type: z.enum(["physical", "digital"]),
  status: z.enum(["active", "paused", "archived"]),
  program_id: z.string().max(64).nullable().optional(),
  category_id: z.string().max(64).nullable().optional(),
  image_url: z.string().max(1200).nullable().optional(),
  current_price: z.number().min(0).nullable().optional(),
  previous_price: z.number().min(0).nullable().optional(),
  commission_percent: z.number().min(0).max(100).nullable().optional(),
  affiliate_url: z.string().max(1500).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
  price_checked_at: z.string().max(40).nullable().optional(),
};

export const listProducts = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(
    z.object({
      search: z.string().max(120).optional(),
      status: z.enum(["active", "paused", "archived"]).optional(),
      type: z.enum(["physical", "digital"]).optional(),
      program_id: z.string().max(64).optional(),
      category_id: z.string().max(64).optional(),
      cursor: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const query = {};
    if (data.search) query.name = { $regex: data.search, $options: "i" };
    if (data.status) query.status = data.status;
    if (data.type) query.type = data.type;
    if (data.program_id) query.program_id = data.program_id;
    if (data.category_id) query.category_id = data.category_id;

    const [page, programs, categories] = await Promise.all([
      db.entities.Product.filter(query, {
        sort: "-created_date",
        limit: 20,
        ...(data.cursor ? { cursor: data.cursor } : {}),
      }),
      db.entities.AffiliateProgram.list({ sort: "name", limit: 100 }),
      db.entities.Category.list({ sort: "name", limit: 100 }),
    ]);

    return {
      items: page?.items ?? [],
      has_more: Boolean(page?.has_more),
      next_cursor: page?.next_cursor ?? null,
      programs: programs?.items ?? [],
      categories: categories?.items ?? [],
    };
  });

export const createProduct = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(productFields))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const created = await db.entities.Product.create(data);
    await logActivity(
      db,
      "product.created",
      `Produto cadastrado: ${created?.name ?? data.name}`,
      "Product",
      created?.id,
    );
    return created;
  });

export const updateProduct = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(productFields).partial().extend({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id, ...patch } = data;
    const updated = await db.entities.Product.update(id, patch);
    await logActivity(
      db,
      "product.updated",
      `Produto atualizado: ${updated?.name ?? patch.name ?? "produto"}`,
      "Product",
      id,
    );
    return updated;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const product = await db.entities.Product.get(data.id).catch(() => null);
    await db.entities.AffiliateLink.deleteMany({ product_id: data.id });
    await db.entities.Product.delete(data.id);
    await logActivity(
      db,
      "product.deleted",
      `Produto removido: ${product?.name ?? data.id}`,
      "Product",
      data.id,
    );
    return { ok: true };
  });

const programFields = {
  name: z.string().min(1).max(160),
  platform: z.enum(["mercado_livre", "amazon", "shopee", "hotmart", "outro"]),
  website_url: z.string().max(1200).nullable().optional(),
  default_commission: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
  is_active: z.boolean(),
};

export const listPrograms = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44();
    const [page, aggregate] = await Promise.all([
      db.entities.AffiliateProgram.list({ sort: "name", limit: 100 }),
      db.entities.Product.aggregate({ groupBy: "program_id" }),
    ]);

    const counts = {};
    (aggregate?.rows ?? []).forEach((row) => {
      if (row.program_id) counts[row.program_id] = row.count;
    });

    return { items: page?.items ?? [], counts };
  });

export const createProgram = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(programFields))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const created = await db.entities.AffiliateProgram.create(data);
    await logActivity(
      db,
      "program.created",
      `Programa cadastrado: ${created?.name ?? data.name}`,
      "AffiliateProgram",
      created?.id,
    );
    return created;
  });

export const updateProgram = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(programFields).partial().extend({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id, ...patch } = data;
    const updated = await db.entities.AffiliateProgram.update(id, patch);
    await logActivity(
      db,
      "program.updated",
      `Programa atualizado: ${updated?.name ?? patch.name ?? "programa"}`,
      "AffiliateProgram",
      id,
    );
    return updated;
  });

export const deleteProgram = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const linked = await db.entities.Product.count({ program_id: data.id });
    if (linked > 0) {
      throw new Error(
        `Este programa possui ${linked} produto(s) vinculado(s). Desvincule antes de excluir.`,
      );
    }
    const program = await db.entities.AffiliateProgram.get(data.id).catch(() => null);
    await db.entities.AffiliateProgram.delete(data.id);
    await logActivity(
      db,
      "program.deleted",
      `Programa removido: ${program?.name ?? data.id}`,
      "AffiliateProgram",
      data.id,
    );
    return { ok: true };
  });

const categoryFields = {
  name: z.string().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
  is_active: z.boolean(),
};

export const listCategories = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44();
    const [page, aggregate] = await Promise.all([
      db.entities.Category.list({ sort: "name", limit: 100 }),
      db.entities.Product.aggregate({ groupBy: "category_id" }),
    ]);

    const counts = {};
    (aggregate?.rows ?? []).forEach((row) => {
      if (row.category_id) counts[row.category_id] = row.count;
    });

    return { items: page?.items ?? [], counts };
  });

export const createCategory = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(categoryFields))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const created = await db.entities.Category.create(data);
    await logActivity(
      db,
      "category.created",
      `Categoria criada: ${created?.name ?? data.name}`,
      "Category",
      created?.id,
    );
    return created;
  });

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(categoryFields).partial().extend({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id, ...patch } = data;
    const updated = await db.entities.Category.update(id, patch);
    await logActivity(
      db,
      "category.updated",
      `Categoria atualizada: ${updated?.name ?? patch.name ?? "categoria"}`,
      "Category",
      id,
    );
    return updated;
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const linked = await db.entities.Product.count({ category_id: data.id });
    if (linked > 0) {
      throw new Error(
        `Esta categoria possui ${linked} produto(s) vinculado(s). Desvincule antes de excluir.`,
      );
    }
    const category = await db.entities.Category.get(data.id).catch(() => null);
    await db.entities.Category.delete(data.id);
    await logActivity(
      db,
      "category.deleted",
      `Categoria removida: ${category?.name ?? data.id}`,
      "Category",
      data.id,
    );
    return { ok: true };
  });

const signalFields = {
  signal_volume: z.number().min(0).max(10).nullable().optional(),
  signal_trend: z.number().min(0).max(10).nullable().optional(),
  signal_demand: z.number().min(0).max(10).nullable().optional(),
  signal_social: z.number().min(0).max(10).nullable().optional(),
  signal_commission: z.number().min(0).max(10).nullable().optional(),
  signal_reputation: z.number().min(0).max(10).nullable().optional(),
  signal_conversion: z.number().min(0).max(10).nullable().optional(),
  signal_saturation: z.number().min(0).max(10).nullable().optional(),
};

export const saveProductSignals = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1), ...signalFields }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id, ...signals } = data;
    return db.entities.Product.update(id, {
      ...signals,
      opportunity_score: computeOpportunityScore(signals),
      signals_updated_at: new Date().toISOString(),
    });
  });

export const listOpportunities = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(
    z.object({
      category_id: z.string().max(64).optional(),
      type: z.enum(["physical", "digital"]).optional(),
      cursor: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const query = { status: { $ne: "archived" } };
    if (data.category_id) query.category_id = data.category_id;
    if (data.type) query.type = data.type;

    const [page, categories, programs, average, scored] = await Promise.all([
      db.entities.Product.filter(query, {
        sort: "-opportunity_score",
        limit: 20,
        ...(data.cursor ? { cursor: data.cursor } : {}),
      }),
      db.entities.Category.list({ sort: "name", limit: 100 }),
      db.entities.AffiliateProgram.list({ sort: "name", limit: 100 }),
      db.entities.Product.aggregate({
        query: { ...query, opportunity_score: { $gte: 0 } },
        avg: ["opportunity_score"],
      }),
      db.entities.Product.count({ ...query, opportunity_score: { $gte: 0 } }),
    ]);

    return {
      items: page?.items ?? [],
      has_more: Boolean(page?.has_more),
      next_cursor: page?.next_cursor ?? null,
      categories: categories?.items ?? [],
      programs: programs?.items ?? [],
      averageScore: average?.rows?.[0]?.avg_opportunity_score ?? null,
      scored,
    };
  });

const signFile = async (db, fileUri) => {
  if (!fileUri) return null;
  try {
    const { signed_url: signedUrl } = await db.integrations.Core.CreateFileSignedUrl({
      file_uri: fileUri,
      expires_in: 3600,
    });
    return signedUrl ?? null;
  } catch {
    return null;
  }
};

const campaignFields = {
  name: z.string().min(1).max(160),
  description: z.string().max(4000).nullable().optional(),
  product_id: z.string().max(64).nullable().optional(),
  objective: z.enum(["sales", "awareness", "engagement", "leads"]),
  platforms: z.array(z.enum(["instagram", "facebook", "tiktok", "pinterest"])).max(4),
  start_date: z.string().max(40).nullable().optional(),
  end_date: z.string().max(40).nullable().optional(),
  status: z.enum(["draft", "active", "paused", "finished", "cancelled"]),
};

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(
    z.object({
      search: z.string().max(120).optional(),
      status: z.enum(["draft", "active", "paused", "finished", "cancelled"]).optional(),
      cursor: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const query = {};
    if (data.search) query.name = { $regex: data.search, $options: "i" };
    if (data.status) query.status = data.status;

    const [page, products, aggregate] = await Promise.all([
      db.entities.Campaign.filter(query, {
        sort: "-created_date",
        limit: 20,
        ...(data.cursor ? { cursor: data.cursor } : {}),
      }),
      db.entities.Product.list({ sort: "name", limit: 200 }),
      db.entities.Post.aggregate({ groupBy: "campaign_id" }),
    ]);

    const postCounts = {};
    (aggregate?.rows ?? []).forEach((row) => {
      if (row.campaign_id) postCounts[row.campaign_id] = row.count;
    });

    return {
      items: page?.items ?? [],
      has_more: Boolean(page?.has_more),
      next_cursor: page?.next_cursor ?? null,
      products: products?.items ?? [],
      postCounts,
    };
  });

export const createCampaign = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(campaignFields))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const created = await db.entities.Campaign.create(data);
    await logActivity(
      db,
      "campaign.created",
      `Campanha criada: ${created?.name ?? data.name}`,
      "Campaign",
      created?.id,
    );
    return created;
  });

export const updateCampaign = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(campaignFields).partial().extend({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id, ...patch } = data;
    const updated = await db.entities.Campaign.update(id, patch);
    await logActivity(
      db,
      "campaign.updated",
      `Campanha atualizada: ${updated?.name ?? patch.name ?? "campanha"}`,
      "Campaign",
      id,
    );
    return updated;
  });

export const deleteCampaign = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const linked = await db.entities.Post.count({ campaign_id: data.id });
    if (linked > 0) {
      throw new Error(
        `Esta campanha possui ${linked} publicação(ões) vinculada(s). Remova ou desvincule antes de excluir.`,
      );
    }
    const campaign = await db.entities.Campaign.get(data.id).catch(() => null);
    await db.entities.Campaign.delete(data.id);
    await logActivity(
      db,
      "campaign.deleted",
      `Campanha removida: ${campaign?.name ?? data.id}`,
      "Campaign",
      data.id,
    );
    return { ok: true };
  });

const postFields = {
  title: z.string().min(1).max(160),
  platform: z.enum(["instagram", "facebook", "tiktok", "pinterest"]),
  format: z.enum(["single_image", "carousel"]),
  campaign_id: z.string().max(64).nullable().optional(),
  product_id: z.string().max(64).nullable().optional(),
  affiliate_link_id: z.string().max(64).nullable().optional(),
  caption: z.string().max(2400).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  cta: z.string().max(240).nullable().optional(),
  hashtags: z.array(z.string().max(60)).max(30).optional(),
  affiliate_disclosure: z.string().max(300).nullable().optional(),
};

export const listPosts = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(
    z.object({
      status: z
        .enum([
          "draft",
          "pending_approval",
          "changes_requested",
          "rejected",
          "approved",
          "scheduled",
          "publishing",
          "published",
          "failed",
          "cancelled",
        ])
        .optional(),
      platform: z.enum(["instagram", "facebook", "tiktok", "pinterest"]).optional(),
      campaign_id: z.string().max(64).optional(),
      cursor: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const query = {};
    if (data.status) query.status = data.status;
    if (data.platform) query.platform = data.platform;
    if (data.campaign_id) query.campaign_id = data.campaign_id;

    const [page, campaigns, products] = await Promise.all([
      db.entities.Post.filter(query, {
        sort: "-updated_date",
        limit: 18,
        ...(data.cursor ? { cursor: data.cursor } : {}),
      }),
      db.entities.Campaign.list({ sort: "-created_date", limit: 100 }),
      db.entities.Product.list({ sort: "name", limit: 200 }),
    ]);

    const posts = page?.items ?? [];
    const ids = posts.map((post) => post.id);
    const assets = ids.length
      ? (await db.entities.PostAsset.filter({ post_id: { $in: ids } }, { sort: "position", limit: 200 }))
          ?.items ?? []
      : [];

    const firstAsset = {};
    const assetCount = {};
    assets.forEach((asset) => {
      assetCount[asset.post_id] = (assetCount[asset.post_id] ?? 0) + 1;
      if (!firstAsset[asset.post_id]) firstAsset[asset.post_id] = asset;
    });

    const thumbnails = await Promise.all(
      posts.map((post) => signFile(db, firstAsset[post.id]?.file_uri)),
    );

    return {
      items: posts.map((post, index) => ({
        ...post,
        thumbnail_url: thumbnails[index],
        asset_count: assetCount[post.id] ?? 0,
      })),
      has_more: Boolean(page?.has_more),
      next_cursor: page?.next_cursor ?? null,
      campaigns: campaigns?.items ?? [],
      products: products?.items ?? [],
    };
  });

export const getPostEditor = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const post = await db.entities.Post.get(data.id).catch(() => null);
    if (!post) return null;

    const [assetPage, campaigns, products, links] = await Promise.all([
      db.entities.PostAsset.filter({ post_id: post.id }, { sort: "position", limit: 50 }),
      db.entities.Campaign.list({ sort: "-created_date", limit: 100 }),
      db.entities.Product.list({ sort: "name", limit: 200 }),
      db.entities.AffiliateLink.list({ sort: "-created_date", limit: 300 }),
    ]);

    const assets = await Promise.all(
      (assetPage?.items ?? []).map(async (asset) => ({
        ...asset,
        signed_url: await signFile(db, asset.file_uri),
      })),
    );

    return {
      post,
      assets,
      campaigns: campaigns?.items ?? [],
      products: products?.items ?? [],
      links: links?.items ?? [],
    };
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(postFields))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const created = await db.entities.Post.create({ ...data, status: "draft", version: 1 });
    await logActivity(
      db,
      "post.created",
      `Publicação criada: ${created?.title ?? data.title}`,
      "Post",
      created?.id,
    );
    return created;
  });

export const updatePost = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(postFields).partial().extend({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id, ...patch } = data;
    const existing = await db.entities.Post.get(id).catch(() => null);

    const contentKeys = [
      "title",
      "platform",
      "format",
      "campaign_id",
      "product_id",
      "affiliate_link_id",
      "caption",
      "description",
      "cta",
      "hashtags",
      "affiliate_disclosure",
    ];
    const contentChanged = Object.keys(patch).some((key) => contentKeys.includes(key));
    const losesApproval = contentChanged && ["approved", "scheduled"].includes(existing?.status);

    if (losesApproval) {
      await db.entities.ScheduledPost.deleteMany({ post_id: id, status: "pending" });
    }

    const updated = await db.entities.Post.update(id, {
      ...patch,
      version: (existing?.version ?? 1) + 1,
      ...(losesApproval
        ? {
            status: "draft",
            approved_version: null,
            approved_at: null,
            approved_snapshot: null,
            scheduled_for: null,
          }
        : {}),
    });
    await logActivity(
      db,
      "post.updated",
      `Publicação atualizada: ${updated?.title ?? patch.title ?? "publicação"}`,
      "Post",
      id,
    );
    return updated;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const post = await db.entities.Post.get(data.id).catch(() => null);
    await db.entities.PostAsset.deleteMany({ post_id: data.id });
    await db.entities.Post.delete(data.id);
    await logActivity(
      db,
      "post.deleted",
      `Publicação removida: ${post?.title ?? data.id}`,
      "Post",
      data.id,
    );
    return { ok: true };
  });

export const addPostAsset = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      post_id: z.string().min(1),
      file_uri: z.string().min(1).max(1000),
      caption: z.string().max(500).nullable().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const position = await db.entities.PostAsset.count({ post_id: data.post_id });
    return db.entities.PostAsset.create({
      post_id: data.post_id,
      file_uri: data.file_uri,
      caption: data.caption ?? null,
      position,
      media_type: "image",
    });
  });

export const updatePostAsset = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1), caption: z.string().max(500).nullable().optional() }))
  .handler(({ data, context }) => {
    const { id, ...patch } = data;
    return context.getBase44().entities.PostAsset.update(id, patch);
  });

export const deletePostAsset = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    await context.getBase44().entities.PostAsset.delete(data.id);
    return { ok: true };
  });

const reviewableStatuses = ["draft", "changes_requested", "rejected"];

export const submitPostForApproval = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const post = await db.entities.Post.get(data.id);
    if (!reviewableStatuses.includes(post.status)) {
      throw new Error(
        "Só rascunhos, publicações com alterações solicitadas ou reprovadas podem ser enviadas para aprovação.",
      );
    }
    const updated = await db.entities.Post.update(data.id, {
      status: "pending_approval",
      review_note: null,
    });
    await logActivity(
      db,
      "post.submitted",
      `Publicação enviada para aprovação: ${post.title}`,
      "Post",
      data.id,
    );
    return updated;
  });

export const approvePost = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1), note: z.string().max(1000).nullable().optional() }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const post = await db.entities.Post.get(data.id);
    if (post.status !== "pending_approval") {
      throw new Error("Esta publicação não está aguardando aprovação.");
    }
    const now = new Date().toISOString();
    const snapshot = JSON.stringify({
      title: post.title,
      platform: post.platform,
      format: post.format,
      caption: post.caption ?? null,
      description: post.description ?? null,
      cta: post.cta ?? null,
      hashtags: post.hashtags ?? [],
      affiliate_disclosure: post.affiliate_disclosure ?? null,
      affiliate_link_id: post.affiliate_link_id ?? null,
      product_id: post.product_id ?? null,
      campaign_id: post.campaign_id ?? null,
    });
    const updated = await db.entities.Post.update(data.id, {
      status: "approved",
      approved_version: post.version ?? 1,
      approved_at: now,
      approved_snapshot: snapshot,
      review_note: data.note ?? null,
      reviewed_at: now,
    });
    await logActivity(
      db,
      "post.approved",
      `Publicação aprovada (v${post.version ?? 1}): ${post.title}`,
      "Post",
      data.id,
    );
    return updated;
  });

export const requestPostChanges = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1), note: z.string().min(3).max(1000) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const post = await db.entities.Post.get(data.id);
    if (post.status !== "pending_approval") {
      throw new Error("Esta publicação não está aguardando aprovação.");
    }
    const updated = await db.entities.Post.update(data.id, {
      status: "changes_requested",
      review_note: data.note,
      reviewed_at: new Date().toISOString(),
    });
    await logActivity(
      db,
      "post.changes_requested",
      `Alterações solicitadas em: ${post.title}`,
      "Post",
      data.id,
    );
    return updated;
  });

export const rejectPost = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1), note: z.string().min(3).max(1000) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const post = await db.entities.Post.get(data.id);
    if (post.status !== "pending_approval") {
      throw new Error("Esta publicação não está aguardando aprovação.");
    }
    const updated = await db.entities.Post.update(data.id, {
      status: "rejected",
      review_note: data.note,
      reviewed_at: new Date().toISOString(),
    });
    await logActivity(db, "post.rejected", `Publicação reprovada: ${post.title}`, "Post", data.id);
    return updated;
  });

export const getApprovalCounts = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const rows = await context.getBase44().entities.Post.aggregate({ groupBy: "status" });
    const counts = {};
    (rows?.rows ?? []).forEach((row) => {
      counts[row.status] = row.count;
    });
    return counts;
  });

export const getCalendar = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(
    z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/),
      platform: z.enum(["instagram", "facebook", "tiktok", "pinterest"]).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const [year, month] = data.month.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1, 3, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 3, 0, 0));

    const query = { scheduled_for: { $gte: start.toISOString(), $lt: end.toISOString() } };
    if (data.platform) query.platform = data.platform;

    const [page, readyPage, queue] = await Promise.all([
      db.entities.Post.filter(query, { sort: "scheduled_for", limit: 200 }),
      db.entities.Post.filter({ status: "approved" }, { sort: "-approved_at", limit: 50 }),
      db.entities.ScheduledPost.aggregate({
        query: { scheduled_for: { $gte: start.toISOString(), $lt: end.toISOString() } },
        groupBy: "status",
      }),
    ]);

    return {
      month: data.month,
      items: page?.items ?? [],
      ready: readyPage?.items ?? [],
      queue: (queue?.rows ?? []).map((row) => ({ status: row.status, count: row.count })),
    };
  });

export const schedulePost = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1), scheduled_for: z.string().min(10).max(40) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const post = await db.entities.Post.get(data.id);
    if (post.status !== "approved") {
      throw new Error("Só publicações aprovadas podem ser agendadas.");
    }
    if ((post.approved_version ?? 0) !== (post.version ?? 1)) {
      throw new Error("A versão atual do conteúdo não está aprovada. Envie para revisão novamente.");
    }

    const scheduledFor = new Date(data.scheduled_for).toISOString();
    const queued = await db.entities.ScheduledPost.count({ post_id: data.id, status: "pending" });
    if (queued === 0) {
      await db.entities.ScheduledPost.create({
        post_id: data.id,
        platform: post.platform,
        scheduled_for: scheduledFor,
        status: "pending",
        attempts: 0,
        idempotency_key: `${data.id}-v${post.version ?? 1}-${Date.now()}`,
      });
    }

    const updated = await db.entities.Post.update(data.id, {
      status: "scheduled",
      scheduled_for: scheduledFor,
    });
    await logActivity(
      db,
      "post.scheduled",
      `Publicação agendada: ${post.title}`,
      "Post",
      data.id,
    );
    return updated;
  });

export const unschedulePost = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const post = await db.entities.Post.get(data.id);
    if (post.status !== "scheduled") {
      throw new Error("Esta publicação não está agendada.");
    }
    await db.entities.ScheduledPost.deleteMany({ post_id: data.id, status: "pending" });
    const updated = await db.entities.Post.update(data.id, {
      status: "approved",
      scheduled_for: null,
    });
    await logActivity(
      db,
      "post.unscheduled",
      `Agendamento cancelado: ${post.title}`,
      "Post",
      data.id,
    );
    return updated;
  });

const linkFields = {
  url: z.string().min(4).max(1500),
  label: z.string().max(120).nullable().optional(),
  is_primary: z.boolean().optional(),
  is_active: z.boolean().optional(),
};

export const listProductLinks = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ product_id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const [page, aggregate] = await Promise.all([
      db.entities.AffiliateLink.filter(
        { product_id: data.product_id },
        { sort: "-created_date", limit: 50 },
      ),
      db.entities.ClickEvent.aggregate({
        query: { product_id: data.product_id },
        groupBy: "affiliate_link_id",
      }),
    ]);

    const clicks = {};
    (aggregate?.rows ?? []).forEach((row) => {
      if (row.affiliate_link_id) clicks[row.affiliate_link_id] = row.count;
    });

    return { items: page?.items ?? [], clicks };
  });

export const createAffiliateLink = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ product_id: z.string().min(1), ...linkFields }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const created = await db.entities.AffiliateLink.create({
      product_id: data.product_id,
      url: data.url,
      label: data.label ?? null,
      is_primary: data.is_primary ?? false,
      is_active: data.is_active ?? true,
      program_id: null,
    });

    if (created?.is_primary) {
      await db.entities.AffiliateLink.updateMany(
        { product_id: data.product_id, is_primary: true, id: { $ne: created.id } },
        { $set: { is_primary: false } },
      );
    }

    await logActivity(
      db,
      "link.created",
      `Link de afiliado adicionado: ${created?.label ?? created?.url ?? "link"}`,
      "AffiliateLink",
      created?.id,
    );
    return created;
  });

export const updateAffiliateLink = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(linkFields).partial().extend({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id, ...patch } = data;
    const existing = await db.entities.AffiliateLink.get(id);
    const updated = await db.entities.AffiliateLink.update(id, patch);

    if (patch.is_primary && existing?.product_id) {
      await db.entities.AffiliateLink.updateMany(
        { product_id: existing.product_id, is_primary: true, id: { $ne: id } },
        { $set: { is_primary: false } },
      );
    }
    return updated;
  });

export const deleteAffiliateLink = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    await db.entities.ClickEvent.deleteMany({ affiliate_link_id: data.id });
    await db.entities.AffiliateLink.delete(data.id);
    await logActivity(db, "link.deleted", "Link de afiliado removido", "AffiliateLink", data.id);
    return { ok: true };
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ days: z.number().int().min(7).max(90).optional() }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const days = data.days ?? 30;
    const since = startOfUtcDay(new Date(Date.now() - (days - 1) * DAY_MS));
    const weekAgo = new Date(Date.now() - 7 * DAY_MS).toISOString();
    const metricFields = ["impressions", "reach", "likes", "comments", "shares", "saves"];

    const [
      total,
      last7,
      byDayRows,
      platformRows,
      productRows,
      linkRows,
      published,
      scheduled,
      metricsByPlatform,
      metricTotals,
      metricCount,
      products,
      links,
    ] = await Promise.all([
      db.entities.ClickEvent.count({}),
      db.entities.ClickEvent.count({ created_date: { $gte: weekAgo } }),
      db.entities.ClickEvent.aggregate({
        query: { created_date: { $gte: since.toISOString() } },
        dateBucket: { field: "created_date", unit: "day" },
      }),
      db.entities.ClickEvent.aggregate({ groupBy: "platform" }),
      db.entities.ClickEvent.aggregate({ groupBy: "product_id" }),
      db.entities.ClickEvent.aggregate({ groupBy: "affiliate_link_id" }),
      db.entities.Post.count({ status: "published" }),
      db.entities.Post.count({ status: "scheduled" }),
      db.entities.PostMetric.aggregate({ groupBy: "platform", sum: metricFields }),
      db.entities.PostMetric.aggregate({ sum: metricFields }),
      db.entities.PostMetric.count({}),
      db.entities.Product.list({ sort: "name", limit: 200 }),
      db.entities.AffiliateLink.list({ limit: 300 }),
    ]);

    const bucketMap = new Map(
      (byDayRows?.rows ?? []).map((row) => [String(row.created_date).slice(0, 10), row.count]),
    );
    const byDay = Array.from({ length: days }, (_, index) => {
      const date = new Date(since.getTime() + index * DAY_MS).toISOString().slice(0, 10);
      return { date, count: bucketMap.get(date) ?? 0 };
    });

    const productNames = Object.fromEntries(
      (products?.items ?? []).map((product) => [product.id, product.name]),
    );
    const linkMap = Object.fromEntries((links?.items ?? []).map((link) => [link.id, link]));

    return {
      days,
      clicks: {
        total,
        last7,
        inRange: byDay.reduce((sum, row) => sum + row.count, 0),
      },
      byDay,
      byPlatform: (platformRows?.rows ?? [])
        .map((row) => ({ platform: row.platform ?? "direto", count: row.count }))
        .sort((a, b) => b.count - a.count),
      topProducts: (productRows?.rows ?? [])
        .filter((row) => row.product_id)
        .map((row) => ({
          id: row.product_id,
          name: productNames[row.product_id] ?? "Produto removido",
          clicks: row.count,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5),
      topLinks: (linkRows?.rows ?? [])
        .filter((row) => row.affiliate_link_id)
        .map((row) => {
          const link = linkMap[row.affiliate_link_id];
          return {
            id: row.affiliate_link_id,
            label: link?.label || link?.url || "Link removido",
            product: link ? productNames[link.product_id] ?? null : null,
            clicks: row.count,
          };
        })
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5),
      posts: { published, scheduled },
      metrics: {
        records: metricCount,
        totals: metricTotals?.rows?.[0] ?? {},
        byPlatform: metricsByPlatform?.rows ?? [],
      },
    };
  });