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
import { PRODUCT_STATUSES, PRODUCT_TYPES } from "@/lib/catalog";
import { createProduct, updateProduct } from "@/lib/server-fns";

const EMPTY_FORM = {
  name: "",
  type: "physical",
  status: "active",
  program_id: "",
  current_price: "",
  previous_price: "",
  commission_percent: "",
  affiliate_url: "",
  image_url: "",
  description: "",
  notes: "",
  priceChecked: false,
};

const toNumber = (raw) => {
  const text = String(raw ?? "").trim().replace(",", ".");
  if (!text) return null;
  const value = Number(text);
  return Number.isNaN(value) ? null : value;
};

const fromProduct = (product) => {
  if (!product) return EMPTY_FORM;
  return {
    name: product.name ?? "",
    type: product.type ?? "physical",
    status: product.status ?? "active",
    program_id: product.program_id ?? "",
    current_price: product.current_price ?? "",
    previous_price: product.previous_price ?? "",
    commission_percent: product.commission_percent ?? "",
    affiliate_url: product.affiliate_url ?? "",
    image_url: product.image_url ?? "",
    description: product.description ?? "",
    notes: product.notes ?? "",
    priceChecked: false,
  };
};

export default function ProductFormDialog({ open, onOpenChange, product, programs }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();
  const create = useServerFn(createProduct);
  const update = useServerFn(updateProduct);

  useEffect(() => {
    if (open) setForm(fromProduct(product));
  }, [open, product]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = useMutation({
    mutationFn: (payload) =>
      product ? update({ data: { id: product.id, ...payload } }) : create({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      toast.success(product ? "Produto atualizado." : "Produto cadastrado.");
      onOpenChange(false);
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível salvar o produto."),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    save.mutate({
      name: form.name.trim(),
      type: form.type,
      status: form.status,
      program_id: form.program_id || null,
      current_price: toNumber(form.current_price),
      previous_price: toNumber(form.previous_price),
      commission_percent: toNumber(form.commission_percent),
      affiliate_url: form.affiliate_url.trim() || null,
      image_url: form.image_url.trim() || null,
      description: form.description.trim() || null,
      notes: form.notes.trim() || null,
      price_checked_at: form.priceChecked
        ? new Date().toISOString()
        : product?.price_checked_at ?? null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            O preço é uma referência manual: ele não é atualizado automaticamente pelo marketplace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Nome do produto</Label>
            <Input
              id="product-name"
              value={form.name}
              onChange={set("name")}
              placeholder="Ex.: Fone Bluetooth ANC"
              maxLength={160}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm((current) => ({ ...current, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  {PRODUCT_STATUSES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Programa de afiliados</Label>
            <Select
              value={form.program_id || "none"}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, program_id: value === "none" ? "" : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem programa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem programa</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {programs.length === 0 && (
              <p className="text-[11.5px] text-muted-foreground">
                Nenhum programa cadastrado ainda. Você pode cadastrar o produto sem programa.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="product-current">Preço atual (R$)</Label>
              <Input
                id="product-current"
                inputMode="decimal"
                value={form.current_price}
                onChange={set("current_price")}
                placeholder="199,90"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-previous">Preço anterior (R$)</Label>
              <Input
                id="product-previous"
                inputMode="decimal"
                value={form.previous_price}
                onChange={set("previous_price")}
                placeholder="249,90"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-commission">Comissão (%)</Label>
              <Input
                id="product-commission"
                inputMode="decimal"
                value={form.commission_percent}
                onChange={set("commission_percent")}
                placeholder="8"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-link">Link de afiliado</Label>
            <Input
              id="product-link"
              value={form.affiliate_url}
              onChange={set("affiliate_url")}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-image">Imagem (URL)</Label>
            <Input
              id="product-image"
              value={form.image_url}
              onChange={set("image_url")}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-description">Descrição</Label>
            <Textarea
              id="product-description"
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Descrição usada como base para o conteúdo das publicações."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-notes">Observações internas</Label>
            <Textarea
              id="product-notes"
              value={form.notes}
              onChange={set("notes")}
              rows={2}
              placeholder="Anotações que não aparecem no conteúdo publicado."
            />
          </div>

          <label className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3">
            <Checkbox
              checked={form.priceChecked}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, priceChecked: Boolean(checked) }))
              }
              className="mt-0.5"
            />
            <span className="text-[12.5px] leading-snug">
              <span className="font-medium text-foreground">Confirmei o preço hoje</span>
              <span className="block text-muted-foreground">
                Registra a data da verificação manual do preço.
              </span>
            </span>
          </label>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!form.name.trim() || save.isPending}>
              {save.isPending ? "Salvando..." : product ? "Salvar alterações" : "Cadastrar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}