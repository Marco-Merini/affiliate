import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

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