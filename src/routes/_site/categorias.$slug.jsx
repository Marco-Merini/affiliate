import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import ProductGrid from "@/components/site/ProductGrid";
import { formatNumber } from "@/lib/format";
import { getStorefrontCategory } from "@/lib/storefront-fns";
import { breadcrumbJsonLd, buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/categorias/$slug")({
  loader: async ({ params }) => {
    const data = await getStorefrontCategory({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Categoria não encontrada" }] };
    const { category, settings } = loaderData;
    return buildHead({
      title: `${category.name} | ${siteName(settings)}`,
      description:
        category.description || `Produtos de ${category.name} com preço de referência e onde comprar.`,
      path: `/categorias/${category.slug}`,
      settings,
      jsonLd: breadcrumbJsonLd(settings, [
        { label: "Início", path: "/" },
        { label: "Categorias", path: "/categorias" },
        { label: category.name, path: `/categorias/${category.slug}` },
      ]),
    });
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, items, total } = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-[120rem] px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Início", to: "/" },
          { label: "Categorias", to: "/categorias" },
          { label: category.name },
        ]}
      />

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-[1.75rem] font-extrabold tracking-[-0.02em] sm:text-[2.25rem]">
            {category.name}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {category.description || `Produtos de ${category.name}.`}
          </p>
        </div>
        <p className="text-[13px] text-muted-foreground">
          {formatNumber(total)} produto{total === 1 ? "" : "s"}
        </p>
      </header>

      <div className="mt-8">
        {items.length ? (
          <ProductGrid products={items} />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <p className="font-heading text-lg font-semibold">Nenhum produto disponível no momento</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Volte em breve para ver novas ofertas.
            </p>
            <Link to="/produtos" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              Ver todos os produtos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}