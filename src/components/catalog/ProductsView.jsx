import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ProductFilters from "@/components/catalog/ProductFilters";
import ProductList from "@/components/catalog/ProductList";
import ProductFormDialog from "@/components/catalog/ProductFormDialog";
import ConfirmDeleteDialog from "@/components/catalog/ConfirmDeleteDialog";
import { deleteProduct, listProducts, updateProduct } from "@/lib/server-fns";
import { formatNumber } from "@/lib/format";

export default function ProductsView() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [programId, setProgramId] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const queryClient = useQueryClient();
  const list = useServerFn(listProducts);
  const update = useServerFn(updateProduct);
  const remove = useServerFn(deleteProduct);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = useInfiniteQuery({
    queryKey: ["products", { search, status, type, programId }],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      list({
        data: {
          search: search || undefined,
          status: status === "all" ? undefined : status,
          type: type === "all" ? undefined : type,
          program_id: programId === "all" ? undefined : programId,
          cursor: pageParam,
        },
      }),
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
  });

  const products = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const programs = query.data?.pages[0]?.programs ?? [];
  const programNames = useMemo(
    () => Object.fromEntries(programs.map((program) => [program.id, program.name])),
    [programs],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["programs"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
  };

  const changeStatus = useMutation({
    mutationFn: ({ id, nextStatus }) => update({ data: { id, status: nextStatus } }),
    onSuccess: () => {
      invalidate();
      toast.success("Situação do produto atualizada.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível atualizar o produto."),
  });

  const destroy = useMutation({
    mutationFn: (id) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
      toast.success("Produto excluído.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível excluir o produto."),
  });

  const isFiltered = Boolean(search) || status !== "all" || type !== "all" || programId !== "all";

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setType("all");
    setProgramId("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[19px] font-bold tracking-tight">Produtos</h1>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Catálogo de produtos físicos e digitais que você divulga como afiliado.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Novo produto
        </Button>
      </div>

      <ProductFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={setStatus}
        type={type}
        onTypeChange={setType}
        programId={programId}
        onProgramChange={setProgramId}
        programs={programs}
        onReset={resetFilters}
        isFiltered={isFiltered}
      />

      {!query.isLoading && products.length > 0 && (
        <p className="text-[11.5px] text-muted-foreground">
          {formatNumber(products.length)} produto{products.length === 1 ? "" : "s"} exibido
          {products.length === 1 ? "" : "s"}
          {query.hasNextPage ? " · há mais resultados" : ""}
        </p>
      )}

      <ProductList
        products={products}
        programNames={programNames}
        isFiltered={isFiltered}
        isLoading={query.isLoading}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        onLoadMore={() => query.fetchNextPage()}
        onCreate={openCreate}
        onEdit={openEdit}
        onChangeStatus={(product, nextStatus) =>
          changeStatus.mutate({ id: product.id, nextStatus })
        }
        onDelete={(product) => setPendingDelete(product)}
      />

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        programs={programs}
      />

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir produto"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" e os links de afiliado vinculados serão removidos. Esta ação não pode ser desfeita.`
            : ""
        }
        pending={destroy.isPending}
        onConfirm={() => pendingDelete && destroy.mutate(pendingDelete.id)}
      />
    </div>
  );
}