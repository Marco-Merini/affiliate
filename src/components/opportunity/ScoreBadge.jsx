import { opportunityTier } from "@/lib/opportunity";
import { cn } from "@/lib/utils";

export default function ScoreBadge({ score, withLabel = false, className }) {
  const tier = opportunityTier(score);
  const hasScore = score !== null && score !== undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
        tier.className,
        className,
      )}
    >
      <span className="tabular-nums">{hasScore ? Math.round(score) : "—"}</span>
      <span className="text-[9.5px] font-medium uppercase tracking-[0.08em] opacity-75">
        {withLabel ? tier.label : "score"}
      </span>
    </span>
  );
}