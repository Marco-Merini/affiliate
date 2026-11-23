import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Tags } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/catalog/CategoryCard";
import CategoryFormDialog from "@/components/catalog/CategoryFormDialog";
import ConfirmDeleteDialog from "@/components/catalog/ConfirmDeleteDialog";
import { deleteCategory, listCategories, updateCategory } from "@/lib/server-fns";
import { formatNumber } from "@/lib/format";

export default function CategoriesView() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const queryClient = useQueryClient();
  const list = useServerFn(listCategories);
  const update = useServerFn(updateCategory);
  const remove = useServerFn(deleteCategory);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => list(),
  });

  const categories = data?.items ?? [];
  const counts = data?.counts ?? {};

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }) => update({ data: { id, is_active: isActive } }),
    onSuccess: () => {
      invalidate();
      toast.success("Categoria atualizada.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível atualizar a categoria."),
  });

  const destroy = useMutation({
    mutationFn: (id) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
      toast.success("Categoria excluída.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível excluir a categoria."),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const linkedCount = pendingDelete ? counts[pendingDelete.id] ?? 0 : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[19px] font-bold tracking-tight">Categorias</h1>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Organize o catálogo por nicho para filtrar produtos e planejar o conteúdo.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nova categoria
        </Button>
      </div>

      {!isLoading && categories.length > 0 && (
        <p className="text-[11.5px] text-muted-foreground">
          {formatNumber(categories.length)} categoria{categories.length === 1 ? "" : "s"} cadastrada
          {categories.length === 1 ? "" : "s"}
        </p>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[168px] animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Tags className="h-5 w-5" />
          </span>
          <p className="text-[14px] font-semibold">Nenhuma categoria cadastrada</p>
          <p className="mt-1 max-w-[46ch] text-[12.5px] leading-relaxed text-muted-foreground">
            Crie a primeira categoria para classificar seus produtos por nicho.
          </p>
          <Button size="sm" className="mt-4" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nova categoria
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              productCount={counts[category.id] ?? 0}
              onEdit={openEdit}
              onToggleActive={(item, checked) =>
                toggleActive.mutate({ id: item.id, isActive: checked })
              }
              onDelete={(item) => setPendingDelete(item)}
            />
          ))}
        </div>
      )}

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editing} />

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir categoria"
        description={
          pendingDelete
            ? linkedCount > 0
              ? `"${pendingDelete.name}" tem ${linkedCount} produto(s) vinculado(s). Desvincule os produtos antes de excluir a categoria.`
              : `"${pendingDelete.name}" será removida definitivamente.`
            : ""
        }
        pending={destroy.isPending}
        onConfirm={() => pendingDelete && destroy.mutate(pendingDelete.id)}
      />
    </div>
  );
}