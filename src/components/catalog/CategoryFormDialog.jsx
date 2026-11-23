import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createCategory, updateCategory } from "@/lib/server-fns";

const EMPTY_FORM = { name: "", description: "", is_active: true };

const fromCategory = (category) =>
  category
    ? {
        name: category.name ?? "",
        description: category.description ?? "",
        is_active: category.is_active ?? true,
      }
    : EMPTY_FORM;

export default function CategoryFormDialog({ open, onOpenChange, category }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();
  const create = useServerFn(createCategory);
  const update = useServerFn(updateCategory);

  useEffect(() => {
    if (open) setForm(fromCategory(category));
  }, [open, category]);

  const save = useMutation({
    mutationFn: (payload) =>
      category ? update({ data: { id: category.id, ...payload } }) : create({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(category ? "Categoria atualizada." : "Categoria criada.");
      onOpenChange(false);
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível salvar a categoria."),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    save.mutate({
      name: form.name.trim(),
      description: form.description.trim() || null,
      is_active: form.is_active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>
            Use categorias para organizar o catálogo por nicho.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Nome da categoria</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(event) => setForm((c) => ({ ...c, name: event.target.value }))}
              placeholder="Ex.: Eletrônicos"
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-description">Descrição</Label>
            <Textarea
              id="category-description"
              value={form.description}
              onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))}
              rows={2}
              placeholder="O que entra nesta categoria."
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <div>
              <p className="text-[12.5px] font-medium">Categoria ativa</p>
              <p className="text-[11px] text-muted-foreground">
                Categorias inativas ficam fora das novas seleções.
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(checked) => setForm((c) => ({ ...c, is_active: checked }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!form.name.trim() || save.isPending}>
              {save.isPending ? "Salvando..." : category ? "Salvar alterações" : "Criar categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}