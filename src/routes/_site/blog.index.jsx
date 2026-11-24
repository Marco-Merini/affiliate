import { createFileRoute } from "@tanstack/react-router";
import ArticleCard from "@/components/site/ArticleCard";
import { listStorefrontArticles } from "@/lib/storefront-fns";
import { breadcrumbJsonLd, buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/blog/")({
  loader: () => listStorefrontArticles({ data: {} }),
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    return buildHead({
      title: `Guias | ${siteName(settings)}`,
      description: "Guias de compra e comparações para escolher o produto certo.",
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
    <div className="mx-auto w-full max-w-[120rem] px-4 py-8 sm:px-6 sm:py-10">
      <header>
        <h1 className="font-heading text-[1.75rem] font-extrabold tracking-[-0.02em] sm:text-[2.25rem]">
          Guias
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Conteúdo para decidir com calma antes de comprar.
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
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <p className="font-heading text-lg font-semibold">Nenhum guia publicado ainda</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Volte em breve para ver novos guias.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}