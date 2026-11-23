import { Button } from "@/components/ui/button";
import ScoreBadge from "@/components/opportunity/ScoreBadge";
import { formatPercent, productTypeLabel } from "@/lib/catalog";
import { formatCurrency, relativeTime } from "@/lib/format";

export default function OpportunityRow({
  position,
  product,
  categoryName,
  programName,
  onAnalyze,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
      <span className="w-6 shrink-0 text-[12px] font-semibold tabular-nums text-muted-foreground">
        {position}º
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold leading-tight">{product.name}</p>
        <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
          {categoryName ?? "Sem categoria"} · {programName ?? "Sem programa"} ·{" "}
          {productTypeLabel(product.type)}
        </p>
        <p className="mt-1 text-[10.5px] text-muted-foreground">
          {product.signals_updated_at
            ? `Analisado ${relativeTime(product.signals_updated_at)}`
            : "Ainda sem análise de oportunidade"}
        </p>
      </div>

      <div className="hidden shrink-0 flex-col items-end sm:flex">
        <span className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
          Comissão
        </span>
        <span className="text-[12px] font-medium">
          {formatPercent(product.commission_percent)}
        </span>
        {product.current_price !== null && product.current_price !== undefined && (
          <span className="text-[10.5px] text-muted-foreground">
            {formatCurrency(product.current_price)}
          </span>
        )}
      </div>

      <ScoreBadge score={product.opportunity_score} className="shrink-0" />

      <Button
        variant="outline"
        size="sm"
        className="shrink-0 text-[12px]"
        onClick={() => onAnalyze(product)}
      >
        Analisar
      </Button>
    </div>
  );
}