import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, PackageSearch, Sparkles } from "lucide-react";
import SearchBar from "@/components/site/SearchBar";
import SectionHeading from "@/components/site/SectionHeading";
import ProductGrid from "@/components/site/ProductGrid";
import CategoryCard from "@/components/site/CategoryCard";
import ArticleCard from "@/components/site/ArticleCard";
import AffiliateNotice from "@/components/site/AffiliateNotice";
import { getStorefrontHome } from "@/lib/storefront-fns";
import { buildHead, organizationJsonLd, siteName, websiteJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/_site/")({
  loader: () => getStorefrontHome({ data: {} }),
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    const name = siteName(settings);
    return buildHead({
      title: settings?.default_title || `${name} · Recomendações e ofertas que valem a pena`,
      description:
        settings?.default_description ||
        settings?.tagline ||
        "Comparativos, guias de compra e ofertas selecionadas de marketplaces confiáveis, com links de afiliados transparentes.",
      path: "/",
      settings,
      jsonLd: [websiteJsonLd(settings), organizationJsonLd(settings)],
    });
  },
  component: StorefrontHome,
});

function StorefrontHome() {
  const { settings, categories, popular, offers, rated, articles, totalProducts } =
    Route.useLoaderData();

  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-muted/70 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-brand" aria-hidden="true" />
              Curadoria independente
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Recomendações que ajudam você a comprar melhor
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Comparamos produtos de marketplaces confiáveis, explicamos o que realmente importa e
              mostramos onde o preço está melhor. Você compra direto na loja parceira.
            </p>

            <div className="mt-6 max-w-xl">
              <SearchBar />
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {[
                "Preços conferidos manualmente",
                "Sem cadastro para navegar",
                "Links de afiliados transparentes",
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-brand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl space-y-14 px-4 py-12 sm:px-6 sm:py-16">
        {categories.length ? (
          <section>
            <SectionHeading
              title="Navegue por categoria"
              description="Encontre mais rápido o tipo de produto que você procura."
              action={{ label: "Ver todas", to: "/categorias" }}
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionHeading
            title="Produtos populares"
            description="Seleção com melhor potencial de custo-benefício segundo nossa análise."
            action={{ label: "Ver catálogo", to: "/produtos" }}
          />
          {popular.length ? (
            <div className="mt-6">
              <ProductGrid products={popular} />
            </div>
          ) : (
            <EmptyStorefront />
          )}
        </section>

        {offers.length ? (
          <section>
            <SectionHeading
              title="Ofertas selecionadas"
              description="Descontos calculados sobre o preço anterior registrado. Confirme o valor final no marketplace."
              action={{ label: "Ver ofertas", to: "/ofertas" }}
            />
            <div className="mt-6">
              <ProductGrid products={offers} />
            </div>
          </section>
        ) : null}

        {rated.length ? (
          <section>
            <SectionHeading
              title="Melhores avaliações"
              description="Produtos com boa reputação e preço competitivo."
            />
            <div className="mt-6">
              <ProductGrid products={rated} />
            </div>
          </section>
        ) : null}

        {articles.length ? (
          <section>
            <SectionHeading
              title="Guias e comparações"
              description="Conteúdo para decidir com calma antes de comprar."
              action={{ label: "Ver todos os guias", to: "/blog" }}
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        ) : null}

        <AffiliateNotice text={settings?.affiliate_disclosure} />
      </div>
    </div>
  );
}

function EmptyStorefront() {
  return (
    <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <PackageSearch className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="font-heading text-base font-semibold">A vitrine está sendo preparada</p>
      <p className="max-w-md text-sm text-muted-foreground">
        Estamos selecionando os primeiros produtos. Enquanto isso, conheça as categorias que vão
        receber as recomendações.
      </p>
      <Link to="/categorias" className="mt-1 text-sm font-semibold text-primary hover:underline">
        Ver categorias
      </Link>
      {totalProducts === 0 ? <span className="sr-only">Nenhum produto publicado</span> : null}
    </div>
  );
}