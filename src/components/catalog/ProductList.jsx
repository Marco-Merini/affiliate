import { Package, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/catalog/ProductCard";

function EmptyState({ filtered, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {filtered ? <SearchX className="h-5 w-5" /> : <Package className="h-5 w-5" />}
      </span>
      <p className="text-[14px] font-semibold">
        {filtered ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
      </p>
      <p className="mt-1 max-w-[46ch] text-[12.5px] leading-relaxed text-muted-foreground">
        {filtered
          ? "Ajuste os filtros para ver outros produtos do catálogo."
          : "Cadastre o primeiro produto para começar a montar suas campanhas de afiliado."}
      </p>
      {!filtered && (
        <Button size="sm" className="mt-4" onClick={onCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Novo produto
        </Button>
      )}
    </div>
  );
}

export default function ProductList({
  products,
  programNames,
  categoryNames,
  isFiltered,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onCreate,
  onEdit,
  onChangeStatus,
  onDelete,
  onAnalyze,
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[104px] animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState filtered={isFiltered} onCreate={onCreate} />;
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          programName={programNames[product.program_id]}
          categoryName={categoryNames[product.category_id]}
          onEdit={onEdit}
          onChangeStatus={onChangeStatus}
          onDelete={onDelete}
          onAnalyze={onAnalyze}
        />
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Carregando..." : "Carregar mais produtos"}
          </Button>
        </div>
      )}
    </div>
  );
}