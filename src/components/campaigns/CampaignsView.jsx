import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Megaphone, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CampaignCard from "@/components/campaigns/CampaignCard";
import CampaignFormDialog from "@/components/campaigns/CampaignFormDialog";
import ConfirmDeleteDialog from "@/components/catalog/ConfirmDeleteDialog";
import { CAMPAIGN_STATUSES } from "@/lib/campaign";
import { deleteCampaign, listCampaigns, updateCampaign } from "@/lib/server-fns";
import { formatNumber } from "@/lib/format";

export default function CampaignsView() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const queryClient = useQueryClient();
  const list = useServerFn(listCampaigns);
  const update = useServerFn(updateCampaign);
  const remove = useServerFn(deleteCampaign);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = useInfiniteQuery({
    queryKey: ["campaigns", { search, status }],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      list({
        data: {
          search: search || undefined,
          status: status === "all" ? undefined : status,
          cursor: pageParam,
        },
      }),
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
  });

  const campaigns = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const products = query.data?.pages[0]?.products ?? [];
  const postCounts = query.data?.pages[0]?.postCounts ?? {};
  const productNames = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, product.name])),
    [products],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
  };

  const changeStatus = useMutation({
    mutationFn: ({ id, nextStatus }) => update({ data: { id, status: nextStatus } }),
    onSuccess: () => {
      invalidate();
      toast.success("Situação da campanha atualizada.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível atualizar a campanha."),
  });

  const destroy = useMutation({
    mutationFn: (id) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
      toast.success("Campanha excluída.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível excluir a campanha."),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (campaign) => {
    setEditing(campaign);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[19px] font-bold tracking-tight">Campanhas</h1>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Agrupe publicações por produto, objetivo e período de divulgação.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nova campanha
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_190px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar campanha pelo nome"
            className="h-9 pl-8 text-[13px]"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as situações</SelectItem>
            {CAMPAIGN_STATUSES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!query.isLoading && campaigns.length > 0 && (
        <p className="text-[11.5px] text-muted-foreground">
          {formatNumber(campaigns.length)} campanha{campaigns.length === 1 ? "" : "s"} exibida
          {campaigns.length === 1 ? "" : "s"}
          {query.hasNextPage ? " · há mais resultados" : ""}
        </p>
      )}

      {query.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[196px] animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Megaphone className="h-5 w-5" />
          </span>
          <p className="text-[14px] font-semibold">Nenhuma campanha encontrada</p>
          <p className="mt-1 max-w-[46ch] text-[12.5px] leading-relaxed text-muted-foreground">
            Crie uma campanha para reunir as publicações de um produto com objetivo e período definidos.
          </p>
          <Button size="sm" className="mt-4" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nova campanha
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                productName={productNames[campaign.product_id]}
                postCount={postCounts[campaign.id] ?? 0}
                onEdit={openEdit}
                onChangeStatus={(item, nextStatus) =>
                  changeStatus.mutate({ id: item.id, nextStatus })
                }
                onDelete={(item) => setPendingDelete(item)}
              />
            ))}
          </div>

          {query.hasNextPage && (
            <div className="flex justify-center pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? "Carregando..." : "Carregar mais campanhas"}
              </Button>
            </div>
          )}
        </>
      )}

      <CampaignFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        campaign={editing}
        products={products}
      />

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir campanha"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" será removida definitivamente. Publicações vinculadas impedem a exclusão.`
            : ""
        }
        pending={destroy.isPending}
        onConfirm={() => pendingDelete && destroy.mutate(pendingDelete.id)}
      />
    </div>
  );
}