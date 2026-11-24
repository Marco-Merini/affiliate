import { createFileRoute, notFound } from "@tanstack/react-router";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import ProductGrid from "@/components/site/ProductGrid";
import SectionHeading from "@/components/site/SectionHeading";
import AffiliateNotice from "@/components/site/AffiliateNotice";
import { Image } from "@/components/ui/image";
import { formatDate } from "@/lib/format";
import { getStorefrontArticle } from "@/lib/storefront-fns";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  buildHead,
  siteBaseUrl,
  siteName,
} from "@/lib/seo";

export const Route = createFileRoute("/_site/blog/$slug")({
  loader: async ({ params }) => {
    const data = await getStorefrontArticle({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Artigo não encontrado" }] };
    const { article, settings } = loaderData;
    const path = `/blog/${article.slug}`;
    return buildHead({
      title: article.meta_title || `${article.title} | ${siteName(settings)}`,
      description: article.meta_description || article.excerpt,
      path,
      settings,
      image: article.cover_image_url,
      type: "article",
      jsonLd: [
        articleJsonLd(settings, article, `${siteBaseUrl(settings)}${path}`),
        breadcrumbJsonLd(settings, [
          { label: "Início", path: "/" },
          { label: "Guias", path: "/blog" },
          { label: article.title, path },
        ]),
      ],
    });
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article, products, settings } = Route.useLoaderData();
  const paragraphs = String(article.content || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Início", to: "/" },
          { label: "Guias", to: "/blog" },
          { label: article.title },
        ]}
      />

      <header className="mt-4">
        {article.category ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {article.category.name}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-xs text-muted-foreground">
          {article.author_name || siteName(settings)} · {formatDate(article.published_at)}
        </p>
      </header>

      {article.cover_image_url ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={article.cover_image_url}
            alt={article.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      ) : null}

      {article.excerpt ? (
        <p className="mt-6 text-base leading-relaxed text-foreground/80">{article.excerpt}</p>
      ) : null}

      <div className="mt-4">
        {paragraphs.length ? (
          paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85"
            >
              {paragraph}
            </p>
          ))
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Este guia está em preparação. Volte em breve para o conteúdo completo.
          </p>
        )}
      </div>

      <div className="mt-8">
        <AffiliateNotice text={settings?.affiliate_disclosure} />
      </div>

      {products.length ? (
        <section className="mt-12">
          <SectionHeading title="Produtos citados neste guia" />
          <div className="mt-5">
            <ProductGrid products={products} columns={3} />
          </div>
        </section>
      ) : null}
    </article>
  );
}