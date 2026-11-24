import { createFileRoute } from "@tanstack/react-router";
import CategoryCard from "@/components/site/CategoryCard";
import { listStorefrontCategories } from "@/lib/storefront-fns";
import { breadcrumbJsonLd, buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/categorias/")({
  loader: () => listStorefrontCategories({ data: {} }),
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    return buildHead({
      title: `Categorias | ${siteName(settings)}`,
      description: "Explore as categorias da loja e encontre o produto que você procura.",
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
    <div className="mx-auto w-full max-w-[120rem] px-4 py-8 sm:px-6 sm:py-10">
      <header>
        <h1 className="font-heading text-[1.75rem] font-extrabold tracking-[-0.02em] sm:text-[2.25rem]">
          Categorias
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Escolha uma categoria para ver os produtos disponíveis.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {!categories.length ? (
        <p className="mt-8 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          Nenhuma categoria publicada ainda.
        </p>
      ) : null}
    </div>
  );
}