import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import SearchBar from "@/components/site/SearchBar";
import CatalogResults from "@/components/site/CatalogResults";
import { formatNumber } from "@/lib/format";
import { listStorefrontProducts } from "@/lib/storefront-fns";
import { buildHead, siteName } from "@/lib/seo";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "score", label: "Mais relevantes" },
  { value: "recent", label: "Atualizados recentemente" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

export const Route = createFileRoute("/_site/produtos/")({
  validateSearch: (search) => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    categoria: typeof search.categoria === "string" && search.categoria ? search.categoria : undefined,
    ordem: SORT_OPTIONS.some((option) => option.value === search.ordem) ? search.ordem : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q, categoria: search.categoria, ordem: search.ordem }),
  loader: ({ deps }) =>
    listStorefrontProducts({ data: { q: deps.q, category: deps.categoria, sort: deps.ordem } }),
  head: ({ loaderData }) => {
    const settings = loaderData?.settings;
    const category = loaderData?.activeCategory;
    const name = siteName(settings);
    return buildHead({
      title: category ? `${category.name} · Produtos e ofertas | ${name}` : `Produtos e ofertas | ${name}`,
      description: category?.description
        ? `${category.description} Compare preços e veja onde comprar com segurança.`
        : "Catálogo de produtos selecionados, com preços de referência, comparações e links para os marketplaces parceiros.",
      path: category ? `/produtos?categoria=${category.slug}` : "/produtos",
      settings,
    });
  },
  component: ProductsPage,
});

function ProductsPage() {
  const { items, has_more, next_cursor, categories, activeCategory, total } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const sort = search.ordem ?? "score";
  const filters = { q: search.q, category: search.categoria, sort: search.ordem };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Catálogo
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {activeCategory ? activeCategory.name : "Todos os produtos"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {activeCategory?.description ||
            "Produtos avaliados por nós, com preço de referência e link direto para o marketplace parceiro."}
        </p>
      </header>

      <div className="mt-6 max-w-2xl">
        <SearchBar defaultValue={search.q ?? ""} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          to="/produtos"
          search={{ q: search.q, ordem: search.ordem }}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            !activeCategory
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground/80 hover:bg-muted",
          )}
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            to="/produtos"
            search={{ q: search.q, categoria: category.slug, ordem: search.ordem }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              activeCategory?.id === category.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/80 hover:bg-muted",
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <p className="text-xs text-muted-foreground">
          {search.q ? (
            <>
              Resultados para <strong className="text-foreground">“{search.q}”</strong> ·{" "}
            </>
          ) : null}
          {formatNumber(total)} produto{total === 1 ? "" : "s"}
        </p>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Ordenar por
          <select
            value={sort}
            onChange={(event) =>
              navigate({
                to: "/produtos",
                search: {
                  q: search.q,
                  categoria: search.categoria,
                  ordem: event.target.value === "score" ? undefined : event.target.value,
                },
              })
            }
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs font-medium text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8">
        <CatalogResults
          key={`${search.q ?? ""}|${search.categoria ?? ""}|${sort}`}
          initial={{ items, has_more, next_cursor }}
          filters={filters}
        />
      </div>
    </div>
  );
}