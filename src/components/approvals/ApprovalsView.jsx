import { useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ApprovalCard from "@/components/approvals/ApprovalCard";
import ReviewDialog from "@/components/approvals/ReviewDialog";
import { getApprovalCounts, listPosts } from "@/lib/server-fns";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

const FILTERS = [
  { value: "pending_approval", label: "Aguardando" },
  { value: "changes_requested", label: "Alterações" },
  { value: "rejected", label: "Reprovadas" },
  { value: "approved", label: "Aprovadas" },
  { value: "scheduled", label: "Agendadas" },
];

export default function ApprovalsView() {
  const [status, setStatus] = useState("pending_approval");
  const [reviewing, setReviewing] = useState(null);

  const list = useServerFn(listPosts);
  const countsFn = useServerFn(getApprovalCounts);

  const countsQuery = useQuery({
    queryKey: ["approval-counts"],
    queryFn: () => countsFn(),
  });
  const counts = countsQuery.data ?? {};

  const query = useInfiniteQuery({
    queryKey: ["posts", { approvals: status }],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => list({ data: { status, cursor: pageParam } }),
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
  });

  const posts = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const campaigns = query.data?.pages[0]?.campaigns ?? [];
  const campaignNames = useMemo(
    () => Object.fromEntries(campaigns.map((campaign) => [campaign.id, campaign.name])),
    [campaigns],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[19px] font-bold tracking-tight">Aprovações</h1>
        <p className="mt-0.5 max-w-[70ch] text-[12.5px] leading-relaxed text-muted-foreground">
          Nenhuma publicação sai daqui sem revisão. Aprovar vale para a versão exibida: qualquer
          alteração no conteúdo exige nova aprovação.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-card px-3.5 py-3">
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Aguardando</p>
          <p className="mt-1 text-[18px] font-bold tabular-nums leading-none">
            {formatNumber(counts.pending_approval ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-3.5 py-3">
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Aprovadas</p>
          <p className="mt-1 text-[18px] font-bold tabular-nums leading-none">
            {formatNumber(counts.approved ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-3.5 py-3">
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Agendadas</p>
          <p className="mt-1 text-[18px] font-bold tabular-nums leading-none">
            {formatNumber(counts.scheduled ?? 0)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => {
          const active = status === filter.value;
          const count = counts[filter.value] ?? 0;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
              <span className={cn("ml-1.5 text-[10.5px]", active ? "opacity-80" : "opacity-70")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {query.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[150px] animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <p className="text-[14px] font-semibold">Nada nesta fila</p>
          <p className="mt-1 max-w-[46ch] text-[12.5px] leading-relaxed text-muted-foreground">
            Envie um rascunho para aprovação pelo estúdio de conteúdo e ele aparece aqui.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {posts.map((post) => (
              <ApprovalCard
                key={post.id}
                post={post}
                campaignName={campaignNames[post.campaign_id]}
                onReview={setReviewing}
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

      <ReviewDialog
        open={Boolean(reviewing)}
        onOpenChange={(open) => !open && setReviewing(null)}
        post={reviewing}
      />
    </div>
  );
}