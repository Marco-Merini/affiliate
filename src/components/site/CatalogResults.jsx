import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/site/ProductGrid";
import { listStorefrontProducts } from "@/lib/storefront-fns";

export default function CatalogResults({ initial, filters }) {
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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <PackageSearch className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-heading text-base font-semibold">Nenhum produto encontrado</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ajuste a busca ou explore outras categorias para encontrar o que precisa.
        </p>
        <Link to="/produtos" className="mt-1 text-sm font-semibold text-primary hover:underline">
          Ver todos os produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProductGrid products={items} />
      {hasMore ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Carregando..." : "Carregar mais produtos"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}