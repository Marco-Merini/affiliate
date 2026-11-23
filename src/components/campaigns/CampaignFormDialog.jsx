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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_STATUSES,
  dateInputToIso,
  dateInputValue,
} from "@/lib/campaign";
import { PLATFORMS } from "@/lib/constants";
import { createCampaign, updateCampaign } from "@/lib/server-fns";

const EMPTY_FORM = {
  name: "",
  description: "",
  product_id: "",
  objective: "sales",
  platforms: ["instagram"],
  start_date: "",
  end_date: "",
  status: "draft",
};

const fromCampaign = (campaign) => {
  if (!campaign) return EMPTY_FORM;
  return {
    name: campaign.name ?? "",
    description: campaign.description ?? "",
    product_id: campaign.product_id ?? "",
    objective: campaign.objective ?? "sales",
    platforms: campaign.platforms ?? [],
    start_date: dateInputValue(campaign.start_date),
    end_date: dateInputValue(campaign.end_date),
    status: campaign.status ?? "draft",
  };
};

export default function CampaignFormDialog({ open, onOpenChange, campaign, products }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();
  const create = useServerFn(createCampaign);
  const update = useServerFn(updateCampaign);

  useEffect(() => {
    if (open) setForm(fromCampaign(campaign));
  }, [open, campaign]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const togglePlatform = (value) =>
    setForm((current) => ({
      ...current,
      platforms: current.platforms.includes(value)
        ? current.platforms.filter((item) => item !== value)
        : [...current.platforms, value],
    }));

  const invalidRange = Boolean(form.start_date && form.end_date && form.end_date < form.start_date);

  const save = useMutation({
    mutationFn: (payload) =>
      campaign ? update({ data: { id: campaign.id, ...payload } }) : create({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      toast.success(campaign ? "Campanha atualizada." : "Campanha criada.");
      onOpenChange(false);
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível salvar a campanha."),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || invalidRange) return;
    save.mutate({
      name: form.name.trim(),
      description: form.description.trim() || null,
      product_id: form.product_id || null,
      objective: form.objective,
      platforms: form.platforms,
      start_date: dateInputToIso(form.start_date),
      end_date: dateInputToIso(form.end_date),
      status: form.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{campaign ? "Editar campanha" : "Nova campanha"}</DialogTitle>
          <DialogDescription>
            A campanha organiza as publicações de um produto. Criar uma campanha não publica nada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="campaign-name">Nome da campanha</Label>
            <Input
              id="campaign-name"
              value={form.name}
              onChange={set("name")}
              placeholder="Ex.: Fone ANC — Black Friday"
              maxLength={160}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="campaign-description">Objetivo e contexto</Label>
            <Textarea
              id="campaign-description"
              value={form.description}
              onChange={set("description")}
              rows={2}
              placeholder="O que essa campanha precisa alcançar."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Produto divulgado</Label>
              <Select
                value={form.product_id || "none"}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, product_id: value === "none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem produto</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Objetivo principal</Label>
              <Select
                value={form.objective}
                onValueChange={(value) => setForm((current) => ({ ...current, objective: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_OBJECTIVES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Plataformas de destino</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <label
                  key={platform.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-[12.5px]"
                >
                  <Checkbox
                    checked={form.platforms.includes(platform.value)}
                    onCheckedChange={() => togglePlatform(platform.value)}
                  />
                  {platform.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="campaign-start">Início</Label>
              <Input
                id="campaign-start"
                type="date"
                value={form.start_date}
                onChange={set("start_date")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="campaign-end">Fim</Label>
              <Input id="campaign-end" type="date" value={form.end_date} onChange={set("end_date")} />
            </div>
          </div>

          {invalidRange && (
            <p className="text-[11.5px] text-destructive">
              A data de fim precisa ser igual ou posterior ao início.
            </p>
          )}

          <div className="space-y-1.5">
            <Label>Situação</Label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm((current) => ({ ...current, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_STATUSES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!form.name.trim() || invalidRange || form.platforms.length === 0 || save.isPending}
            >
              {save.isPending ? "Salvando..." : campaign ? "Salvar alterações" : "Criar campanha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}