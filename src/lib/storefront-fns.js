import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { discountPercent, slugify } from "@/lib/seo";

const PLATFORM_LABELS = {
  mercado_livre: "Mercado Livre",
  amazon: "Amazon",
  shopee: "Shopee",
  hotmart: "Hotmart",
  outro: "Outro",
};

const publicSettings = (row) =>
  row
    ? {
        site_name: row.site_name ?? "Radar de Ofertas",
        tagline: row.tagline ?? null,
        default_title: row.default_title ?? null,
        default_description: row.default_description ?? null,
        base_url: row.base_url ?? null,
        logo_url: row.logo_url ?? null,
        affiliate_disclosure: row.affiliate_disclosure ?? null,
        contact_email: row.contact_email ?? null,
        allow_indexing: row.allow_indexing !== false,
        search_console_verification: row.search_console_verification ?? null,
      }
    : null;

const publicCategory = (category) => ({
  id: category.id,
  name: category.name,
  slug: category.slug || slugify(category.name),
  description: category.description ?? null,
  image_url: category.image_url ?? null,
});

const publicProduct = (product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug || slugify(product.name),
  description: product.description ?? null,
  type: product.type,
  image_url: product.image_url ?? null,
  current_price: product.current_price ?? null,
  previous_price: product.previous_price ?? null,
  discount: discountPercent(product.current_price, product.previous_price),
  rating: product.rating ?? null,
  review_count: product.review_count ?? null,
  price_checked_at: product.price_checked_at ?? null,
  category_id: product.category_id ?? null,
  program_id: product.program_id ?? null,
  updated_date: product.updated_date ?? null,
});

const publicArticle = (article) => ({
  id: article.id,
  title: article.title,
  slug: article.slug || slugify(article.title),
  excerpt: article.excerpt ?? null,
  cover_image_url: article.cover_image_url ?? null,
  category_id: article.category_id ?? null,
  primary_keyword: article.primary_keyword ?? null,
  author_name: article.author_name ?? null,
  published_at: article.published_at ?? article.created_date ?? null,
});

const readSettings = async (db) => {
  const page = await db.entities.SeoSettings.list({ sort: "-created_date", limit: 1 });
  return publicSettings(page?.items?.[0] ?? null);
};

const readCategories = async (db) =>
  (await db.entities.Category.filter({ is_active: true }, { sort: "name", limit: 60 }))?.items ?? [];

const SORT_MAP = {
  score: "-opportunity_score",
  recent: "-updated_date",
  price_asc: "current_price",
  price_desc: "-current_price",
};

export const getPublicSettings = createServerFn({ method: "GET" })
  .validator(z.object({}))
  .handler(async ({ context }) => readSettings(context.getBase44().asServiceRole));

export const getStorefrontHome = createServerFn({ method: "GET" })
  .validator(z.object({}))
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;

    const [categories, settings] = await Promise.all([readCategories(db), readSettings(db)]);
    const categoryById = Object.fromEntries(categories.map((item) => [item.id, publicCategory(item)]));
    const withCategory = (items) =>
      (items ?? []).map((item) => ({
        ...publicProduct(item),
        category: categoryById[item.category_id] ?? null,
      }));

    const [popularPage, offerPage, ratedPage, articlesPage, totalProducts] = await Promise.all([
      db.entities.Product.filter({ status: "active" }, { sort: "-opportunity_score", limit: 8 }),
      db.entities.Product.filter(
        { status: "active", previous_price: { $gt: 0 } },
        { sort: "-updated_date", limit: 60 },
      ),
      db.entities.Product.filter({ status: "active", rating: { $gte: 4 } }, { sort: "-rating", limit: 8 }),
      db.entities.Article.filter({ status: "published" }, { sort: "-published_at", limit: 3 }),
      db.entities.Product.count({ status: "active" }),
    ]);

    const offers = withCategory(offerPage?.items)
      .filter((item) => item.discount)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 6);

    return {
      settings,
      categories: categories.map(publicCategory),
      popular: withCategory(popularPage?.items),
      offers,
      rated: withCategory(ratedPage?.items),
      articles: (articlesPage?.items ?? []).map(publicArticle),
      totalProducts,
    };
  });

export const listStorefrontProducts = createServerFn({ method: "GET" })
  .validator(
    z.object({
      q: z.string().max(120).optional(),
      category: z.string().max(120).optional(),
      sort: z.enum(["score", "recent", "price_asc", "price_desc"]).optional(),
      cursor: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const [categories, settings] = await Promise.all([readCategories(db), readSettings(db)]);

    let activeCategory = null;
    if (data.category) {
      activeCategory =
        categories.find((item) => (item.slug || slugify(item.name)) === data.category) ?? null;
    }

    const query = { status: "active" };
    if (data.q) query.name = { $regex: data.q, $options: "i" };
    if (activeCategory) query.category_id = activeCategory.id;

    const page = await db.entities.Product.filter(query, {
      sort: SORT_MAP[data.sort ?? "score"],
      limit: 24,
      ...(data.cursor ? { cursor: data.cursor } : {}),
    });

    const categoryById = Object.fromEntries(categories.map((item) => [item.id, publicCategory(item)]));
    const total = await db.entities.Product.count(query);

    return {
      settings,
      categories: categories.map(publicCategory),
      activeCategory: activeCategory ? publicCategory(activeCategory) : null,
      items: (page?.items ?? []).map((item) => ({
        ...publicProduct(item),
        category: categoryById[item.category_id] ?? null,
      })),
      has_more: Boolean(page?.has_more),
      next_cursor: page?.next_cursor ?? null,
      total,
    };
  });

export const getStorefrontProduct = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(120) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;

    let product = null;
    const bySlug = await db.entities.Product.filter(
      { slug: data.slug, status: "active" },
      { limit: 1 },
    );
    product = bySlug?.items?.[0] ?? null;

    if (!product) {
      const fallback = await db.entities.Product.filter({ status: "active" }, { limit: 300 });
      product = (fallback?.items ?? []).find((item) => slugify(item.name) === data.slug) ?? null;
    }

    if (!product) return null;

    const [category, program, linksPage, relatedPage, settings] = await Promise.all([
      product.category_id
        ? db.entities.Category.get(product.category_id).catch(() => null)
        : Promise.resolve(null),
      product.program_id
        ? db.entities.AffiliateProgram.get(product.program_id).catch(() => null)
        : Promise.resolve(null),
      db.entities.AffiliateLink.filter(
        { product_id: product.id, is_active: true },
        { sort: "-created_date", limit: 20 },
      ),
      db.entities.Product.filter(
        { status: "active", category_id: product.category_id },
        { sort: "-opportunity_score", limit: 5 },
      ),
      readSettings(db),
    ]);

    return {
      settings,
      product: {
        ...publicProduct(product),
        category: category ? publicCategory(category) : null,
        marketplace: program ? PLATFORM_LABELS[program.platform] ?? program.name : null,
        program_name: program?.name ?? null,
      },
      links: (linksPage?.items ?? []).map((link) => ({
        id: link.id,
        label: link.label ?? null,
        is_primary: Boolean(link.is_primary),
      })),
      related: (relatedPage?.items ?? [])
        .filter((item) => item.id !== product.id)
        .slice(0, 4)
        .map((item) => ({
          ...publicProduct(item),
          category: category ? publicCategory(category) : null,
        })),
    };
  });

export const listStorefrontCategories = createServerFn({ method: "GET" })
  .validator(z.object({}))
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const [categories, settings, aggregate] = await Promise.all([
      readCategories(db),
      readSettings(db),
      db.entities.Product.aggregate({
        query: { status: "active" },
        groupBy: "category_id",
      }),
    ]);

    const counts = {};
    (aggregate?.rows ?? []).forEach((row) => {
      if (row.category_id) counts[row.category_id] = row.count;
    });

    return {
      settings,
      categories: categories.map((category) => ({
        ...publicCategory(category),
        product_count: counts[category.id] ?? 0,
      })),
    };
  });

export const getStorefrontCategory = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(120) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const categories = await readCategories(db);
    const category =
      categories.find((item) => (item.slug || slugify(item.name)) === data.slug) ?? null;
    if (!category) return null;

    const [page, settings] = await Promise.all([
      db.entities.Product.filter(
        { status: "active", category_id: category.id },
        { sort: "-opportunity_score", limit: 24 },
      ),
      readSettings(db),
    ]);

    const publicCat = publicCategory(category);
    return {
      settings,
      category: publicCat,
      categories: categories.map(publicCategory),
      items: (page?.items ?? []).map((item) => ({ ...publicProduct(item), category: publicCat })),
      total: await db.entities.Product.count({ status: "active", category_id: category.id }),
    };
  });

export const getStorefrontOffers = createServerFn({ method: "GET" })
  .validator(z.object({}))
  .handler(async ({ context }) => {
    const db = context.getBase44().asServiceRole;
    const [categories, settings, page] = await Promise.all([
      readCategories(db),
      readSettings(db),
      db.entities.Product.filter(
        { status: "active", previous_price: { $gt: 0 } },
        { sort: "-updated_date", limit: 60 },
      ),
    ]);

    const categoryById = Object.fromEntries(categories.map((item) => [item.id, publicCategory(item)]));
    const offers = (page?.items ?? [])
      .map((item) => ({
        ...publicProduct(item),
        category: categoryById[item.category_id] ?? null,
      }))
      .filter((item) => item.discount)
      .sort((a, b) => b.discount - a.discount);

    return { settings, categories: categories.map(publicCategory), offers };
  });

export const listStorefrontArticles = createServerFn({ method: "GET" })
  .validator(z.object({ category: z.string().max(120).optional() }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const [categories, settings] = await Promise.all([readCategories(db), readSettings(db)]);

    let categoryId;
    if (data.category) {
      const match = categories.find((item) => (item.slug || slugify(item.name)) === data.category);
      categoryId = match?.id;
    }

    const page = await db.entities.Article.filter(
      { status: "published", ...(categoryId ? { category_id: categoryId } : {}) },
      { sort: "-published_at", limit: 24 },
    );

    const categoryById = Object.fromEntries(categories.map((item) => [item.id, publicCategory(item)]));
    return {
      settings,
      categories: categories.map(publicCategory),
      items: (page?.items ?? []).map((item) => ({
        ...publicArticle(item),
        category: categoryById[item.category_id] ?? null,
      })),
    };
  });

export const getStorefrontArticle = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(160) }))
  .handler(async ({ data, context }) => {
    const db = context.getBase44().asServiceRole;
    const bySlug = await db.entities.Article.filter(
      { slug: data.slug, status: "published" },
      { limit: 1 },
    );
    const article = bySlug?.items?.[0] ?? null;
    if (!article) return null;

    const [settings, categories, productsPage] = await Promise.all([
      readSettings(db),
      readCategories(db),
      article.product_ids?.length
        ? db.entities.Product.filter({ id: { $in: article.product_ids }, status: "active" }, { limit: 20 })
        : Promise.resolve({ items: [] }),
    ]);

    const categoryById = Object.fromEntries(categories.map((item) => [item.id, publicCategory(item)]));
    return {
      settings,
      article: {
        ...publicArticle(article),
        content: article.content ?? null,
        meta_title: article.meta_title ?? null,
        meta_description: article.meta_description ?? null,
        category: categoryById[article.category_id] ?? null,
      },
      products: (productsPage?.items ?? []).map((item) => ({
        ...publicProduct(item),
        category: categoryById[item.category_id] ?? null,
      })),
    };
  });