import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Link2, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createAffiliateLink,
  deleteAffiliateLink,
  listProductLinks,
  updateAffiliateLink,
} from "@/lib/server-fns";
import { formatNumber } from "@/lib/format";

const trackedUrl = (linkId) =>
  typeof window === "undefined" ? "" : `${window.location.origin}/api/r/${linkId}`;

export default function AffiliateLinksDialog({ open, onOpenChange, product }) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const queryClient = useQueryClient();
  const list = useServerFn(listProductLinks);
  const create = useServerFn(createAffiliateLink);
  const update = useServerFn(updateAffiliateLink);
  const remove = useServerFn(deleteAffiliateLink);

  useEffect(() => {
    if (open) {
      setLabel("");
      setUrl("");
      setIsPrimary(false);
    }
  }, [open, product?.id]);

  const { data, isLoading } = useQuery({
    queryKey: ["product-links", product?.id],
    queryFn: () => list({ data: { product_id: product.id } }),
    enabled: open && Boolean(product?.id),
  });

  const links = data?.items ?? [];
  const clicks = data?.clicks ?? {};

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["product-links", product?.id] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          product_id: product.id,
          url: url.trim(),
          label: label.trim() || null,
          is_primary: isPrimary,
          is_active: true,
        },
      }),
    onSuccess: () => {
      invalidate();
      setLabel("");
      setUrl("");
      setIsPrimary(false);
      toast.success("Link adicionado.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível adicionar o link."),
  });

  const primaryMutation = useMutation({
    mutationFn: (id) => update({ data: { id, is_primary: true } }),
    onSuccess: () => {
      invalidate();
      toast.success("Link principal atualizado.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível atualizar o link."),
  });

  const destroy = useMutation({
    mutationFn: (id) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Link removido.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível remover o link."),
  });

  const copyTracked = async (linkId) => {
    try {
      await navigator.clipboard.writeText(trackedUrl(linkId));
      toast.success("Link rastreado copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const validUrl = /^https?:\/\/.+\..+/i.test(url.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="pr-6 text-left">
            Links de afiliado{product ? ` · ${product.name}` : ""}
          </DialogTitle>
          <DialogDescription className="text-left">
            Use o link rastreado no conteúdo: cada clique passa pelo AffiliateFlow e é contabilizado
            antes de abrir a loja.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-3 rounded-lg border border-border bg-muted/30 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!validUrl) return;
            createMutation.mutate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="link-label">Identificação</Label>
              <Input
                id="link-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Ex.: Bio do Instagram"
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link-url">Link de afiliado</Label>
              <Input
                id="link-url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
                maxLength={1500}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Checkbox
                checked={isPrimary}
                onCheckedChange={(checked) => setIsPrimary(Boolean(checked))}
              />
              Link principal do produto
            </label>
            <Button type="submit" size="sm" disabled={!validUrl || createMutation.isPending}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {createMutation.isPending ? "Adicionando..." : "Adicionar link"}
            </Button>
          </div>
          {url && !validUrl && (
            <p className="text-[11px] text-destructive">Informe uma URL completa com http:// ou https://.</p>
          )}
        </form>

        {isLoading ? (
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
        ) : links.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <Link2 className="mb-2 h-4 w-4 text-muted-foreground" />
            <p className="text-[12.5px] font-semibold">Nenhum link cadastrado</p>
            <p className="mt-1 max-w-[42ch] text-[11.5px] text-muted-foreground">
              Cadastre o primeiro link para começar a rastrear cliques deste produto.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.id} className="rounded-lg border border-border p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-[12.5px] font-semibold">
                        {link.label || "Link de afiliado"}
                      </p>
                      {link.is_primary && (
                        <Badge
                          variant="outline"
                          className="rounded-md border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[9.5px] font-semibold text-emerald-700 dark:text-emerald-400"
                        >
                          Principal
                        </Badge>
                      )}
                      {link.is_active === false && (
                        <Badge variant="outline" className="rounded-md px-1.5 py-0 text-[9.5px]">
                          Inativo
                        </Badge>
                      )}
                      <span className="text-[10.5px] text-muted-foreground">
                        {formatNumber(clicks[link.id] ?? 0)} cliques
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[10.5px] text-muted-foreground">{link.url}</p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/80">
                      {trackedUrl(link.id)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Copiar link rastreado"
                      onClick={() => copyTracked(link.id)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {!link.is_primary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Tornar principal"
                        onClick={() => primaryMutation.mutate(link.id)}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      aria-label="Remover link"
                      onClick={() => destroy.mutate(link.id)}
                      disabled={destroy.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}