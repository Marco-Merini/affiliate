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
      title: `${category.name} · Produtos recomendados | ${siteName(settings)}`,
      description:
        category.description ||
        `Produtos de ${category.name} selecionados e comparados para você comprar melhor.`,
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
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Início", to: "/" },
          { label: "Categorias", to: "/categorias" },
          { label: category.name },
        ]}
      />

      <header className="mt-4 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {category.description ||
            `Recomendações de ${category.name} com preços de referência e links para os marketplaces parceiros.`}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {formatNumber(total)} produto{total === 1 ? "" : "s"} publicado{total === 1 ? "" : "s"}
        </p>
      </header>

      <div className="mt-8">
        {items.length ? (
          <ProductGrid products={items} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <p className="font-heading text-base font-semibold">Ainda não há produtos aqui</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Estamos selecionando as primeiras recomendações desta categoria.
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