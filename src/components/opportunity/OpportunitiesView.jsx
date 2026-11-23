import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OpportunityRow from "@/components/opportunity/OpportunityRow";
import OpportunityDialog from "@/components/opportunity/OpportunityDialog";
import { OPPORTUNITY_SIGNALS } from "@/lib/opportunity";
import { PRODUCT_TYPES } from "@/lib/catalog";
import { listOpportunities } from "@/lib/server-fns";
import { formatNumber } from "@/lib/format";

function Kpi({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-3">
      <p className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[18px] font-bold tabular-nums leading-none">{value}</p>
    </div>
  );
}

export default function OpportunitiesView() {
  const [categoryId, setCategoryId] = useState("all");
  const [type, setType] = useState("all");
  const [analyzing, setAnalyzing] = useState(null);

  const list = useServerFn(listOpportunities);

  const query = useInfiniteQuery({
    queryKey: ["opportunities", { categoryId, type }],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      list({
        data: {
          category_id: categoryId === "all" ? undefined : categoryId,
          type: type === "all" ? undefined : type,
          cursor: pageParam,
        },
      }),
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
  });

  const products = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const categories = query.data?.pages[0]?.categories ?? [];
  const programs = query.data?.pages[0]?.programs ?? [];
  const scored = query.data?.pages[0]?.scored ?? 0;
  const averageScore = query.data?.pages[0]?.averageScore ?? null;

  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const programNames = useMemo(
    () => Object.fromEntries(programs.map((program) => [program.id, program.name])),
    [programs],
  );

  const bestScore = products.find((product) => product.opportunity_score !== null)
    ?.opportunity_score;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[19px] font-bold tracking-tight">Oportunidades</h1>
        <p className="mt-0.5 max-w-[70ch] text-[12.5px] leading-relaxed text-muted-foreground">
          Ranking dos seus produtos por potencial comercial, somando sinais de mercado, comissão e
          concorrência. Todos os nichos competem na mesma lista.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Kpi label="Analisados" value={formatNumber(scored)} />
        <Kpi
          label="Score médio"
          value={averageScore === null ? "—" : Math.round(averageScore)}
        />
        <Kpi label="Melhor score" value={bestScore === undefined || bestScore === null ? "—" : Math.round(bestScore)} />
      </div>

      <div className="rounded-xl border border-border bg-card p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Pesos do score
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {OPPORTUNITY_SIGNALS.map((signal) => (
            <span
              key={signal.key}
              className="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
            >
              {signal.label} · {signal.weight}%
              {signal.invert ? " (invertido)" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:max-w-[420px]">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-9 w-full text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 w-full text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {PRODUCT_TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[92px] animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Target className="h-5 w-5" />
          </span>
          <p className="text-[14px] font-semibold">Nenhum produto para comparar</p>
          <p className="mt-1 max-w-[46ch] text-[12.5px] leading-relaxed text-muted-foreground">
            Cadastre produtos ativos e registre os sinais de mercado para ver o ranking de
            oportunidades.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link to="/produtos">Ir para produtos</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product, index) => (
            <OpportunityRow
              key={product.id}
              position={index + 1}
              product={product}
              categoryName={categoryNames[product.category_id]}
              programName={programNames[product.program_id]}
              onAnalyze={setAnalyzing}
            />
          ))}

          {query.hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? "Carregando..." : "Carregar mais produtos"}
              </Button>
            </div>
          )}
        </div>
      )}

      <OpportunityDialog
        open={Boolean(analyzing)}
        onOpenChange={(open) => !open && setAnalyzing(null)}
        product={analyzing}
      />
    </div>
  );
}