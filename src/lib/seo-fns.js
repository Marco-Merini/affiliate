import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const settingsFields = {
  site_name: z.string().min(1).max(80),
  tagline: z.string().max(160).nullable().optional(),
  default_title: z.string().max(120).nullable().optional(),
  default_description: z.string().max(320).nullable().optional(),
  base_url: z.string().max(300).nullable().optional(),
  logo_url: z.string().max(1200).nullable().optional(),
  affiliate_disclosure: z.string().max(600).nullable().optional(),
  allow_indexing: z.boolean(),
  robots_extra: z.string().max(2000).nullable().optional(),
  search_console_verification: z.string().max(300).nullable().optional(),
  search_console_property: z.string().max(300).nullable().optional(),
  contact_email: z.string().max(160).nullable().optional(),
};

export const getSeoWorkspace = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44();
    const [settingsPage, keywordsPage, categoriesPage] = await Promise.all([
      db.entities.SeoSettings.list({ sort: "-created_date", limit: 1 }),
      db.entities.Keyword.list({ sort: "-created_date", limit: 200 }),
      db.entities.Category.list({ sort: "name", limit: 100 }),
    ]);

    return {
      settings: settingsPage?.items?.[0] ?? null,
      keywords: keywordsPage?.items ?? [],
      categories: categoriesPage?.items ?? [],
    };
  });

export const saveSeoSettings = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().max(64).optional(),
      ...settingsFields,
    }),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id, ...payload } = data;
    if (id) return db.entities.SeoSettings.update(id, payload);
    return db.entities.SeoSettings.create(payload);
  });

const keywordFields = {
  keyword: z.string().min(2).max(160),
  intent: z.enum(["informational", "commercial", "transactional", "navigational"]),
  category_id: z.string().max(64).nullable().optional(),
  target_url: z.string().max(500).nullable().optional(),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["planned", "in_progress", "published"]),
  notes: z.string().max(1000).nullable().optional(),
};

export const createKeyword = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(keywordFields))
  .handler(({ data, context }) => context.getBase44().entities.Keyword.create(data));

export const updateKeyword = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object(keywordFields).partial().extend({ id: z.string().min(1) }))
  .handler(({ data, context }) => {
    const { id, ...patch } = data;
    return context.getBase44().entities.Keyword.update(id, patch);
  });

export const deleteKeyword = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    await context.getBase44().entities.Keyword.delete(data.id);
    return { ok: true };
  });