import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Network, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ProgramCard from "@/components/catalog/ProgramCard";
import ProgramFormDialog from "@/components/catalog/ProgramFormDialog";
import ConfirmDeleteDialog from "@/components/catalog/ConfirmDeleteDialog";
import { deleteProgram, listPrograms, updateProgram } from "@/lib/server-fns";
import { formatNumber } from "@/lib/format";

export default function ProgramsView() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const queryClient = useQueryClient();
  const list = useServerFn(listPrograms);
  const update = useServerFn(updateProgram);
  const remove = useServerFn(deleteProgram);

  const { data, isLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: () => list(),
  });

  const programs = data?.items ?? [];
  const counts = data?.counts ?? {};

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["programs"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
  };

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }) => update({ data: { id, is_active: isActive } }),
    onSuccess: () => {
      invalidate();
      toast.success("Programa atualizado.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível atualizar o programa."),
  });

  const destroy = useMutation({
    mutationFn: (id) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
      toast.success("Programa excluído.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível excluir o programa."),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (program) => {
    setEditing(program);
    setFormOpen(true);
  };

  const linkedCount = pendingDelete ? counts[pendingDelete.id] ?? 0 : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[19px] font-bold tracking-tight">Programas de afiliados</h1>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Marketplaces e plataformas de produtores que originam seus links.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Novo programa
        </Button>
      </div>

      {!isLoading && programs.length > 0 && (
        <p className="text-[11.5px] text-muted-foreground">
          {formatNumber(programs.length)} programa{programs.length === 1 ? "" : "s"} cadastrado
          {programs.length === 1 ? "" : "s"}
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
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Network className="h-5 w-5" />
          </span>
          <p className="text-[14px] font-semibold">Nenhum programa cadastrado</p>
          <p className="mt-1 max-w-[46ch] text-[12.5px] leading-relaxed text-muted-foreground">
            Cadastre o primeiro programa para vincular seus produtos e manter a comissão organizada.
          </p>
          <Button size="sm" className="mt-4" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Novo programa
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              productCount={counts[program.id] ?? 0}
              onEdit={openEdit}
              onToggleActive={(item, checked) =>
                toggleActive.mutate({ id: item.id, isActive: checked })
              }
              onDelete={(item) => setPendingDelete(item)}
            />
          ))}
        </div>
      )}

      <ProgramFormDialog open={formOpen} onOpenChange={setFormOpen} program={editing} />

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir programa"
        description={
          pendingDelete
            ? linkedCount > 0
              ? `"${pendingDelete.name}" tem ${linkedCount} produto(s) vinculado(s). Desvincule os produtos antes de excluir o programa.`
              : `"${pendingDelete.name}" será removido definitivamente.`
            : ""
        }
        pending={destroy.isPending}
        onConfirm={() => pendingDelete && destroy.mutate(pendingDelete.id)}
      />
    </div>
  );
}