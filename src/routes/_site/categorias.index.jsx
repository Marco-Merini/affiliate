import { createFileRoute } from "@tanstack/react-router";
import CategoryCard from "@/components/site/CategoryCard";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { listStorefrontCategories } from "@/lib/storefront-fns";
import { breadcrumbJsonLd, buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/categorias/")({
  loader: () => listStorefrontCategories({ data: {} }),
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    return buildHead({
      title: `Categorias de produtos | ${siteName(settings)}`,
      description:
        "Explore as categorias da vitrine: tecnologia, casa, cozinha, beleza, esportes, informática e mais.",
      path: "/categorias",
      settings,
      jsonLd: breadcrumbJsonLd(settings, [
        { label: "Início", path: "/" },
        { label: "Categorias", path: "/categorias" },
      ]),
    });
  },
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories } = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Categorias" }]} />

      <header className="mt-4 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Categorias
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Escolha uma categoria para ver os produtos recomendados e comparar as opções.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col gap-1">
            <CategoryCard category={category} />
            <span className="px-1 text-[11px] text-muted-foreground">
              {category.product_count === 1
                ? "1 produto publicado"
                : `${category.product_count} produtos publicados`}
            </span>
          </div>
        ))}
      </div>

      {!categories.length ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          Nenhuma categoria publicada ainda.
        </p>
      ) : null}
    </div>
  );
}