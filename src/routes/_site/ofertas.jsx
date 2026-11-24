import { createFileRoute } from "@tanstack/react-router";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import ProductGrid from "@/components/site/ProductGrid";
import AffiliateNotice from "@/components/site/AffiliateNotice";
import { getStorefrontOffers } from "@/lib/storefront-fns";
import { breadcrumbJsonLd, buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/ofertas")({
  loader: () => getStorefrontOffers({ data: {} }),
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    return buildHead({
      title: `Ofertas selecionadas | ${siteName(settings)}`,
      description:
        "Ofertas com desconto conferido sobre o preço anterior registrado. Compare antes de comprar no marketplace parceiro.",
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
  const { offers, settings } = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Ofertas" }]} />

      <header className="mt-4 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ofertas selecionadas
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Descontos calculados sobre o preço anterior registrado por nós. O valor final é sempre o
          do marketplace parceiro.
        </p>
      </header>

      <div className="mt-8">
        {offers.length ? (
          <ProductGrid products={offers} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <p className="font-heading text-base font-semibold">Nenhuma oferta ativa agora</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Só publicamos desconto quando existe preço anterior registrado. Volte em breve.
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 max-w-2xl">
        <AffiliateNotice text={settings?.affiliate_disclosure} />
      </div>
    </div>
  );
}