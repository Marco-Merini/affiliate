import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConnectionCard from "@/components/marketplace/ConnectionCard";
import ResultCard from "@/components/marketplace/ResultCard";
import {
  disconnectMercadoLivre,
  getMercadoLivreAuthUrl,
  getMercadoLivreStatus,
  importMercadoLivreProducts,
  searchMercadoLivreProducts,
} from "@/lib/marketplace-fns";

const STATUS_MESSAGES = {
  conectado: "Conta do Mercado Livre conectada.",
  "sem-credenciais": "Credenciais do Mercado Livre não configuradas.",
  invalido: "Autorização inválida ou expirada. Tente conectar novamente.",
  erro: "Não foi possível concluir a conexão com o Mercado Livre.",
};

export default function MercadoLivreImportView({ mlStatus }) {
  const queryClient = useQueryClient();
  const statusFn = useServerFn(getMercadoLivreStatus);
  const authUrlFn = useServerFn(getMercadoLivreAuthUrl);
  const disconnectFn = useServerFn(disconnectMercadoLivre);
  const searchFn = useServerFn(searchMercadoLivreProducts);
  const importFn = useServerFn(importMercadoLivreProducts);

  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [categoryId, setCategoryId] = useState("none");

  const status = useQuery({
    queryKey: ["mercado-livre-status"],
    queryFn: () => statusFn({ data: {} }),
  });

  const configured = status.data?.configured ?? false;
  const connected = status.data?.connected ?? false;
  const categories = status.data?.categories ?? [];

  useEffect(() => {
    if (!mlStatus) return;
    const message = STATUS_MESSAGES[mlStatus];
    if (!message) return;
    if (mlStatus === "conectado") toast.success(message);
    else toast.error(message);
  }, [mlStatus]);

  const connect = useMutation({
    mutationFn: () => authUrlFn({ data: {} }),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível iniciar a conexão."),
  });

  const disconnect = useMutation({
    mutationFn: () => disconnectFn({ data: {} }),
    onSuccess: () => {
      setResults([]);
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["mercado-livre-status"] });
      toast.success("Conta do Mercado Livre desconectada.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível desconectar."),
  });

  const search = useMutation({
    mutationFn: () => searchFn({ data: { query: term.trim() } }),
    onSuccess: (data) => {
      setResults(data.items ?? []);
      setSelected([]);
      if (!(data.items ?? []).length) toast.info("Nenhum produto encontrado para esse termo.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível buscar no Mercado Livre."),
  });

  const importSelected = useMutation({
    mutationFn: () =>
      importFn({
        data: {
          category_id: categoryId === "none" ? null : categoryId,
          items: results
            .filter((item) => selected.includes(item.external_id))
            .map((item) => ({
              external_id: item.external_id,
              name: item.name,
              price: item.price,
              original_price: item.original_price,
              image_url: item.image_url,
              permalink: item.permalink,
            })),
        },
      }),
    onSuccess: ({ imported, skipped }) => {
      toast.success(
        `${imported} produto(s) publicado(s) na vitrine${skipped ? ` · ${skipped} já existiam` : ""}.`,
      );
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível importar os produtos."),
  });

  const toggle = (id) =>
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    );

  const canSearch = connected && term.trim().length >= 2 && !search.isPending;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[19px] font-bold tracking-tight">Importar do Mercado Livre</h1>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          Busque produtos reais pelo catálogo do Mercado Livre e publique direto na vitrine.
        </p>
      </div>

      <ConnectionCard
        configured={configured}
        connected={connected}
        nickname={status.data?.nickname}
        onConnect={() => connect.mutate()}
        onDisconnect={() => disconnect.mutate()}
        connecting={connect.isPending}
        disconnecting={disconnect.isPending}
      />

      {connected ? (
        <>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (canSearch) search.mutate();
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Ex.: fone bluetooth, air fryer, teclado mecânico"
                className="pl-9"
                maxLength={80}
              />
            </div>
            <Button type="submit" disabled={!canSearch}>
              {search.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Buscar
            </Button>
          </form>

          {results.length ? (
            <div className="space-y-3">
              <p className="text-[11.5px] text-muted-foreground">
                {results.length} resultado(s) · {selected.length} selecionado(s)
              </p>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((item) => (
                  <ResultCard
                    key={item.external_id}
                    item={item}
                    checked={selected.includes(item.external_id)}
                    onToggle={() => toggle(item.external_id)}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="sm:w-72">
                  <Label className="text-[12px]">Categoria na vitrine</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="mt-1.5 h-9">
                      <SelectValue placeholder="Sem categoria" />
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

                <Button
                  onClick={() => importSelected.mutate()}
                  disabled={!selected.length || importSelected.isPending}
                >
                  {importSelected.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Publicar {selected.length || ""} na vitrine
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-[13px] font-medium">Busque um produto para começar</p>
              <p className="mx-auto mt-1 max-w-md text-[12px] leading-relaxed text-muted-foreground">
                Os produtos importados entram ativos na vitrine, com preço, imagem e link de
                afiliado rastreado pelo próprio sistema.
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}