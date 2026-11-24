import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageSearch, Tag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import SearchBar from "@/components/site/SearchBar";
import SectionHeading from "@/components/site/SectionHeading";
import ProductGrid from "@/components/site/ProductGrid";
import ArticleCard from "@/components/site/ArticleCard";
import { getStorefrontHome } from "@/lib/storefront-fns";
import { buildHead, organizationJsonLd, siteName, websiteJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/")({
  loader: () => getStorefrontHome({ data: {} }),
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    const name = siteName(settings);
    return buildHead({
      title: settings?.default_title || `${name} · Ofertas e produtos selecionados`,
      description:
        settings?.default_description ||
        settings?.tagline ||
        "Ofertas e produtos selecionados dos principais marketplaces, com preço de referência e onde comprar.",
      path: "/",
      settings,
      jsonLd: [websiteJsonLd(settings), organizationJsonLd(settings)],
    });
  },
  component: StorefrontHome,
});

function StorefrontHome() {
  const { categories, popular, offers, rated, articles } = Route.useLoaderData();

  return (
    <div>
      <section className="border-b border-border bg-muted/60">
        <div className="mx-auto w-full max-w-[120rem] px-4 py-10 sm:px-6 sm:py-12">
          <h1 className="font-heading text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em] sm:text-[2.5rem]">
            O que você quer encontrar hoje?
          </h1>

          <div className="mt-5 max-w-[720px]">
            <SearchBar size="lg" placeholder="Busque por produto, marca ou categoria" />
          </div>

          {categories.length ? (
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {categories.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  to="/produtos"
                  search={{ categoria: category.slug }}
                  className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[13px] font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Tag className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[120rem] space-y-16 px-4 py-12 sm:px-6 sm:py-16">
        <section>
          <SectionHeading title="Mais populares" action={{ label: "Ver tudo", to: "/produtos" }} />
          <div className="mt-6">
            {popular.length ? <ProductGrid products={popular} /> : <EmptyStorefront />}
          </div>
        </section>

        {offers.length ? (
          <section>
            <SectionHeading
              title="Ofertas com desconto"
              action={{ label: "Ver tudo", to: "/ofertas" }}
            />
            <div className="mt-6">
              <ProductGrid products={offers} />
            </div>
          </section>
        ) : null}

        {rated.length ? (
          <section>
            <SectionHeading title="Melhores avaliações" action={{ label: "Ver tudo", to: "/produtos" }} />
            <div className="mt-6">
              <ProductGrid products={rated} />
            </div>
          </section>
        ) : null}

        {articles.length ? (
          <section>
            <SectionHeading title="Guias" action={{ label: "Ver tudo", to: "/blog" }} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function EmptyStorefront() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <PackageSearch className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <p className="font-heading text-lg font-semibold">Nenhum produto disponível no momento</p>
      <p className="max-w-md text-sm text-muted-foreground">Volte em breve para ver novas ofertas.</p>
      <Link to="/categorias" className={cn(buttonVariants({ variant: "outline" }), "mt-1 rounded-full")}>
        Ver categorias
      </Link>
    </div>
  );
}