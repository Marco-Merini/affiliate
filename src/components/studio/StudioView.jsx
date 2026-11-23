import { useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PenLine, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PostCard from "@/components/studio/PostCard";
import ConfirmDeleteDialog from "@/components/catalog/ConfirmDeleteDialog";
import { PLATFORMS, POST_STATUSES } from "@/lib/constants";
import { createPost, deletePost, listPosts } from "@/lib/server-fns";
import { formatNumber } from "@/lib/format";

export default function StudioView() {
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [campaignId, setCampaignId] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const list = useServerFn(listPosts);
  const create = useServerFn(createPost);
  const remove = useServerFn(deletePost);

  const query = useInfiniteQuery({
    queryKey: ["posts", { status, platform, campaignId }],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      list({
        data: {
          status: status === "all" ? undefined : status,
          platform: platform === "all" ? undefined : platform,
          campaign_id: campaignId === "all" ? undefined : campaignId,
          cursor: pageParam,
        },
      }),
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
  });

  const posts = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const campaigns = query.data?.pages[0]?.campaigns ?? [];
  const campaignNames = useMemo(
    () => Object.fromEntries(campaigns.map((campaign) => [campaign.id, campaign.name])),
    [campaigns],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
  };

  const createDraft = useMutation({
    mutationFn: () =>
      create({
        data: {
          title: "Nova publicação",
          platform: "instagram",
          format: "single_image",
          hashtags: [],
        },
      }),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate({ to: "/estudio/$postId", params: { postId: post.id } });
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível criar a publicação."),
  });

  const destroy = useMutation({
    mutationFn: (id) => remove({ data: { id } }),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
      toast.success("Publicação excluída.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível excluir a publicação."),
  });

  const isFiltered = status !== "all" || platform !== "all" || campaignId !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[19px] font-bold tracking-tight">Estúdio de conteúdo</h1>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Escreva legendas, chamadas e carrosséis. Tudo fica como rascunho até a aprovação.
          </p>
        </div>
        <Button size="sm" onClick={() => createDraft.mutate()} disabled={createDraft.isPending}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {createDraft.isPending ? "Criando..." : "Nova publicação"}
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as situações</SelectItem>
            {POST_STATUSES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="h-9 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as plataformas</SelectItem>
            {PLATFORMS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={campaignId} onValueChange={setCampaignId}>
          <SelectTrigger className="h-9 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as campanhas</SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!query.isLoading && posts.length > 0 && (
        <p className="text-[11.5px] text-muted-foreground">
          {formatNumber(posts.length)} publicação{posts.length === 1 ? "" : "ões"} exibida
          {posts.length === 1 ? "" : "s"}
          {query.hasNextPage ? " · há mais resultados" : ""}
        </p>
      )}

      {query.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[248px] animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <PenLine className="h-5 w-5" />
          </span>
          <p className="text-[14px] font-semibold">
            {isFiltered ? "Nenhuma publicação com esses filtros" : "Nenhuma publicação criada"}
          </p>
          <p className="mt-1 max-w-[48ch] text-[12.5px] leading-relaxed text-muted-foreground">
            {isFiltered
              ? "Ajuste os filtros para ver outros rascunhos."
              : "Comece um rascunho, escreva a legenda e envie as imagens do carrossel."}
          </p>
          {!isFiltered && (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => createDraft.mutate()}
              disabled={createDraft.isPending}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nova publicação
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                campaignName={campaignNames[post.campaign_id]}
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
                {query.isFetchingNextPage ? "Carregando..." : "Carregar mais publicações"}
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir publicação"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" e as imagens vinculadas serão removidas. Esta ação não pode ser desfeita.`
            : ""
        }
        pending={destroy.isPending}
        onConfirm={() => pendingDelete && destroy.mutate(pendingDelete.id)}
      />
    </div>
  );
}