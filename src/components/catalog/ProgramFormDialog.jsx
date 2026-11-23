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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROGRAM_PLATFORMS } from "@/lib/catalog";
import { createProgram, updateProgram } from "@/lib/server-fns";

const EMPTY_FORM = {
  name: "",
  platform: "mercado_livre",
  website_url: "",
  default_commission: "",
  notes: "",
  is_active: true,
};

const fromProgram = (program) => {
  if (!program) return EMPTY_FORM;
  return {
    name: program.name ?? "",
    platform: program.platform ?? "mercado_livre",
    website_url: program.website_url ?? "",
    default_commission: program.default_commission ?? "",
    notes: program.notes ?? "",
    is_active: program.is_active ?? true,
  };
};

const toNumber = (raw) => {
  const text = String(raw ?? "").trim().replace(",", ".");
  if (!text) return null;
  const value = Number(text);
  return Number.isNaN(value) ? null : value;
};

export default function ProgramFormDialog({ open, onOpenChange, program }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();
  const create = useServerFn(createProgram);
  const update = useServerFn(updateProgram);

  useEffect(() => {
    if (open) setForm(fromProgram(program));
  }, [open, program]);

  const save = useMutation({
    mutationFn: (payload) =>
      program ? update({ data: { id: program.id, ...payload } }) : create({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      toast.success(program ? "Programa atualizado." : "Programa cadastrado.");
      onOpenChange(false);
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível salvar o programa."),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    save.mutate({
      name: form.name.trim(),
      platform: form.platform,
      website_url: form.website_url.trim() || null,
      default_commission: toNumber(form.default_commission),
      notes: form.notes.trim() || null,
      is_active: form.is_active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{program ? "Editar programa" : "Novo programa"}</DialogTitle>
          <DialogDescription>
            Cadastre a origem dos seus links de afiliado para vincular aos produtos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="program-name">Nome do programa</Label>
            <Input
              id="program-name"
              value={form.name}
              onChange={(event) => setForm((c) => ({ ...c, name: event.target.value }))}
              placeholder="Ex.: Amazon Associados"
              maxLength={160}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Plataforma</Label>
              <Select
                value={form.platform}
                onValueChange={(value) => setForm((c) => ({ ...c, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_PLATFORMS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="program-commission">Comissão padrão (%)</Label>
              <Input
                id="program-commission"
                inputMode="decimal"
                value={form.default_commission}
                onChange={(event) =>
                  setForm((c) => ({ ...c, default_commission: event.target.value }))
                }
                placeholder="8"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="program-site">Site oficial</Label>
            <Input
              id="program-site"
              value={form.website_url}
              onChange={(event) => setForm((c) => ({ ...c, website_url: event.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="program-notes">Observações</Label>
            <Textarea
              id="program-notes"
              value={form.notes}
              onChange={(event) => setForm((c) => ({ ...c, notes: event.target.value }))}
              rows={3}
              placeholder="Regras do programa, prazos de atribuição, requisitos de divulgação."
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <div>
              <p className="text-[12.5px] font-medium">Programa ativo</p>
              <p className="text-[11px] text-muted-foreground">
                Programas inativos não devem receber novos produtos.
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
              {save.isPending ? "Salvando..." : program ? "Salvar alterações" : "Cadastrar programa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}