import { createFileRoute } from "@tanstack/react-router";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import ArticleCard from "@/components/site/ArticleCard";
import { listStorefrontArticles } from "@/lib/storefront-fns";
import { breadcrumbJsonLd, buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/blog/")({
  loader: () => listStorefrontArticles({ data: {} }),
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    return buildHead({
      title: `Guias e comparações | ${siteName(settings)}`,
      description:
        "Guias de compra, comparativos e recomendações para escolher o produto certo antes de comprar.",
      path: "/blog",
      settings,
      jsonLd: breadcrumbJsonLd(settings, [
        { label: "Início", path: "/" },
        { label: "Guias", path: "/blog" },
      ]),
    });
  },
  component: BlogPage,
});

function BlogPage() {
  const { items } = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Guias" }]} />

      <header className="mt-4 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Guias e comparações
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Conteúdo original para decidir com calma: o que importa em cada categoria, o que evitar e
          onde o preço compensa.
        </p>
      </header>

      <div className="mt-8">
        {items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <p className="font-heading text-base font-semibold">Os primeiros guias estão a caminho</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Estamos preparando comparativos e guias de compra por categoria. Enquanto isso,
              explore o catálogo de produtos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}