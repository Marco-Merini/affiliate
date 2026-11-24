import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
      title: category ? `${category.name} · Produtos | ${name}` : `Produtos | ${name}`,
      description: category?.description
        ? category.description
        : "Catálogo de produtos com preços de referência e onde comprar.",
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
    <div className="mx-auto w-full max-w-[120rem] px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-[1.75rem] font-extrabold tracking-[-0.02em] sm:text-[2.25rem]">
            {activeCategory ? activeCategory.name : "Produtos"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {activeCategory?.description ||
              "Produtos selecionados, com preço de referência e onde comprar."}
          </p>
        </div>
        <p className="text-[13px] text-muted-foreground">
          {search.q ? (
            <>
              Busca: <strong className="text-foreground">“{search.q}”</strong> ·{" "}
            </>
          ) : null}
          {formatNumber(total)} produto{total === 1 ? "" : "s"}
        </p>
      </header>

      <div className="sticky top-[60px] z-30 mt-6 flex flex-wrap items-center gap-3 border-y border-border bg-background/95 py-3 backdrop-blur sm:top-[72px]">
        <div className="flex flex-1 gap-2 overflow-x-auto pb-0.5">
          <Link
            to="/produtos"
            search={{ q: search.q, ordem: search.ordem }}
            className={cn(
              "flex h-9 shrink-0 items-center rounded-full border px-4 text-[13px] font-medium transition-colors",
              !activeCategory
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-accent",
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
                "flex h-9 shrink-0 items-center rounded-full border px-4 text-[13px] font-medium transition-colors",
                activeCategory?.id === category.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <label className="flex shrink-0 items-center gap-2 text-[13px] text-muted-foreground">
          Ordenar
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
            className="h-11 rounded-xl border border-input bg-card px-3 text-[13px] font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          total={total}
        />
      </div>
    </div>
  );
}