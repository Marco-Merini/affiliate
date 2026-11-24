import { createFileRoute } from "@tanstack/react-router";
import { slugify } from "@/lib/seo";

const BASE_FALLBACK = "https://large-smart-affiliate-flow.base44.app";

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const entry = (base, path, lastmod, priority) => `  <url>
    <loc>${escapeXml(`${base}${path}`)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <priority>${priority}</priority>
  </url>`;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const db = context.getBase44().asServiceRole;
        const [settingsPage, productsPage, categoriesPage, articlesPage] = await Promise.all([
          db.entities.SeoSettings.list({ sort: "-created_date", limit: 1 }),
          db.entities.Product.filter({ status: "active" }, { sort: "-updated_date", limit: 500 }),
          db.entities.Category.filter({ is_active: true }, { sort: "name", limit: 200 }),
          db.entities.Article.filter({ status: "published" }, { sort: "-published_at", limit: 500 }),
        ]);

        const settings = settingsPage?.items?.[0] ?? null;
        const base = String(settings?.base_url || BASE_FALLBACK).replace(/\/+$/, "");
        const today = new Date().toISOString().slice(0, 10);

        const urls = [
          entry(base, "/", today, "1.0"),
          entry(base, "/produtos", today, "0.9"),
          entry(base, "/categorias", today, "0.8"),
          entry(base, "/ofertas", today, "0.8"),
          entry(base, "/blog", today, "0.7"),
          ...(categoriesPage?.items ?? []).map((category) =>
            entry(base, `/categorias/${category.slug || slugify(category.name)}`, today, "0.7"),
          ),
          ...(productsPage?.items ?? []).map((product) =>
            entry(
              base,
              `/produtos/${product.slug || slugify(product.name)}`,
              String(product.updated_date ?? "").slice(0, 10) || today,
              "0.8",
            ),
          ),
          ...(articlesPage?.items ?? []).map((article) =>
            entry(
              base,
              `/blog/${article.slug || slugify(article.title)}`,
              String(article.published_at ?? article.updated_date ?? "").slice(0, 10) || today,
              "0.6",
            ),
          ),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600",
          },
        });
      },
    },
  },
});