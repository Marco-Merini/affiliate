import { createFileRoute, Link } from "@tanstack/react-router";
import ProductGrid from "@/components/site/ProductGrid";
import { formatNumber } from "@/lib/format";
import { getStorefrontOffers } from "@/lib/storefront-fns";
import { breadcrumbJsonLd, buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/ofertas")({
  loader: () => getStorefrontOffers({ data: {} }),
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    return buildHead({
      title: `Ofertas | ${siteName(settings)}`,
      description: "Produtos com desconto sobre o preço anterior registrado.",
      path: "/ofertas",
      settings,
      jsonLd: breadcrumbJsonLd(settings, [
        { label: "Início", path: "/" },
        { label: "Ofertas", path: "/ofertas" },
      ]),
    });
  },
  component: OffersPage,
});

function OffersPage() {
  const { offers } = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-[120rem] px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-[1.75rem] font-extrabold tracking-[-0.02em] sm:text-[2.25rem]">
            Ofertas
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Produtos com desconto sobre o preço anterior registrado.
          </p>
        </div>
        <p className="text-[13px] text-muted-foreground">
          {formatNumber(offers.length)} oferta{offers.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="mt-8">
        {offers.length ? (
          <ProductGrid products={offers} />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <p className="font-heading text-lg font-semibold">Nenhuma oferta no momento</p>
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