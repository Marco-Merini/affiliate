import Panel from "@/components/dashboard/Panel";
import { formatNumber } from "@/lib/format";

export default function TopList({ title, description, items, emptyText }) {
  return (
    <Panel title={title} description={description}>
      {items.length === 0 ? (
        <div className="flex h-[160px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 text-center">
          <p className="max-w-[38ch] text-[11.5px] leading-relaxed text-muted-foreground">
            {emptyText}
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10.5px] font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium">{item.label}</p>
                {item.sublabel ? (
                  <p className="truncate text-[10.5px] text-muted-foreground">{item.sublabel}</p>
                ) : null}
              </div>
              <span className="shrink-0 text-[12px] font-semibold tabular-nums">
                {formatNumber(item.value)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}