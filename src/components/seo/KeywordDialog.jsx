import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createKeyword, updateKeyword } from "@/lib/seo-fns";
import { KEYWORD_INTENTS, KEYWORD_PRIORITIES, KEYWORD_STATUSES } from "@/lib/keywords";

const EMPTY = {
  keyword: "",
  intent: "commercial",
  category_id: "",
  target_url: "",
  priority: "medium",
  status: "planned",
  notes: "",
};

export default function KeywordDialog({ open, onOpenChange, keyword, categories }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const create = useServerFn(createKeyword);
  const update = useServerFn(updateKeyword);
  const router = useRouter();
  const editing = Boolean(keyword?.id);

  useEffect(() => {
    if (!open) return;
    setForm(
      keyword
        ? {
            keyword: keyword.keyword ?? "",
            intent: keyword.intent ?? "commercial",
            category_id: keyword.category_id ?? "",
            target_url: keyword.target_url ?? "",
            priority: keyword.priority ?? "medium",
            status: keyword.status ?? "planned",
            notes: keyword.notes ?? "",
          }
        : EMPTY,
    );
  }, [open, keyword?.id]);

  const update_field = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.keyword.trim().length < 2) {
      toast.error("Informe a palavra-chave");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        keyword: form.keyword.trim(),
        intent: form.intent,
        category_id: form.category_id || null,
        target_url: form.target_url.trim() || null,
        priority: form.priority,
        status: form.status,
        notes: form.notes.trim() || null,
      };
      if (editing) {
        await update({ data: { id: keyword.id, ...payload } });
      } else {
        await create({ data: payload });
      }
      toast.success(editing ? "Palavra-chave atualizada" : "Palavra-chave criada");
      onOpenChange(false);
      await router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Não foi possível salvar a palavra-chave");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar palavra-chave" : "Nova palavra-chave"}</DialogTitle>
            <DialogDescription>
              Planeje o termo de busca, a intenção e a página de destino. O sistema não estima
              volume de pesquisa.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="keyword">Palavra-chave</Label>
              <Input
                id="keyword"
                value={form.keyword}
                onChange={(event) => update_field("keyword", event.target.value)}
                placeholder="melhor fone bluetooth custo-benefício"
                maxLength={160}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Intenção</Label>
              <Select
                value={form.intent}
                onValueChange={(value) => update_field("intent", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KEYWORD_INTENTS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select
                value={form.category_id || "none"}
                onValueChange={(value) => update_field("category_id", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select
                value={form.priority}
                onValueChange={(value) => update_field("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KEYWORD_PRIORITIES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => update_field("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KEYWORD_STATUSES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="target_url">Página de destino</Label>
              <Input
                id="target_url"
                value={form.target_url}
                onChange={(event) => update_field("target_url", event.target.value)}
                placeholder="/produtos ou /blog/comparativo-fones"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => update_field("notes", event.target.value)}
                rows={2}
                maxLength={1000}
                placeholder="Fonte de dados, concorrência observada, ângulo do conteúdo"
              />
            </div>
          </div>

          <DialogFooter className="mt-5">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}