import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/site/ProductGrid";
import { formatNumber } from "@/lib/format";
import { listStorefrontProducts } from "@/lib/storefront-fns";

export default function CatalogResults({ initial, filters, total }) {
  const [items, setItems] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [loading, setLoading] = useState(false);
  const fetchPage = useServerFn(listStorefrontProducts);

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const next = await fetchPage({ data: { ...filters, cursor } });
      setItems((current) => [...current, ...next.items]);
      setCursor(next.next_cursor);
      setHasMore(next.has_more);
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <PackageSearch className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="font-heading text-lg font-bold tracking-[-0.01em]">Nenhum resultado encontrado</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ajuste a busca ou explore outras categorias para encontrar o que precisa.
        </p>
        <Button asChild variant="outline" className="mt-1 rounded-full">
          <Link to="/produtos" search={{}}>
            Limpar filtros
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProductGrid products={items} />

      <div className="flex flex-col items-center gap-3">
        <p className="text-[13px] text-muted-foreground">
          Mostrando {formatNumber(items.length)} de {formatNumber(total ?? items.length)}
        </p>
        {hasMore ? (
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="h-12 w-[200px] rounded-full"
          >
            {loading ? "Carregando..." : "Carregar mais"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}