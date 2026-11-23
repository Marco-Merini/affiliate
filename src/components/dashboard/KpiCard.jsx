import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONES = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  danger: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
};

export default function KpiCard({ label, value, hint, icon: Icon, tone = "default", loading }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-[0_2px_10px_rgba(16,24,40,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", TONES[tone])}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 font-heading text-[26px] font-extrabold leading-none tracking-tight">
        {loading ? (
          <span className="inline-block h-7 w-14 animate-pulse rounded bg-muted" />
        ) : (
          formatNumber(value)
        )}
      </p>
      {hint ? <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}