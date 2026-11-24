import { createFileRoute } from "@tanstack/react-router";

const BASE_FALLBACK = "https://large-smart-affiliate-flow.base44.app";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const db = context.getBase44().asServiceRole;
        const settingsPage = await db.entities.SeoSettings.list({ sort: "-created_date", limit: 1 });
        const settings = settingsPage?.items?.[0] ?? null;
        const base = String(settings?.base_url || BASE_FALLBACK).replace(/\/+$/, "");

        const lines = [];
        if (settings && settings.allow_indexing === false) {
          lines.push("User-agent: *", "Disallow: /");
        } else {
          lines.push("User-agent: *", "Allow: /", "Disallow: /painel", "Disallow: /api/");
          const extra = String(settings?.robots_extra ?? "").trim();
          if (extra) lines.push("", extra);
          lines.push("", `Sitemap: ${base}/sitemap.xml`);
        }

        return new Response(`${lines.join("\n")}\n`, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600",
          },
        });
      },
    },
  },
});