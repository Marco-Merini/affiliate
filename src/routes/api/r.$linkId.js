import { createFileRoute } from "@tanstack/react-router";

const PLATFORMS = ["instagram", "facebook", "tiktok", "pinterest", "direto"];

export const Route = createFileRoute("/api/r/$linkId")({
  server: {
    handlers: {
      GET: async ({ request, params, context }) => {
        const db = context.getBase44();
        const link = await db.asServiceRole.entities.AffiliateLink.get(params.linkId).catch(
          () => null,
        );

        if (!link || link.is_active === false) {
          return new Response("Link não encontrado ou inativo.", { status: 404 });
        }

        const destination = String(link.url ?? "");
        if (!/^https?:\/\//i.test(destination)) {
          return new Response("Destino inválido.", { status: 400 });
        }

        const url = new URL(request.url);
        const platformParam = url.searchParams.get("p");
        const postId = url.searchParams.get("post");

        await db.asServiceRole.entities.ClickEvent.create({
          affiliate_link_id: link.id,
          product_id: link.product_id ?? null,
          post_id: postId ? String(postId).slice(0, 64) : null,
          platform: PLATFORMS.includes(platformParam) ? platformParam : "direto",
          referrer: request.headers.get("referer") ?? null,
          occurred_at: new Date().toISOString(),
        }).catch(() => null);

        return Response.redirect(destination, 302);
      },
    },
  },
});