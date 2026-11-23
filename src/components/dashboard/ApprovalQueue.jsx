import { CheckCircle2 } from "lucide-react";
import Panel from "@/components/dashboard/Panel";
import { platformLabel } from "@/lib/constants";
import { relativeTime } from "@/lib/format";

export default function ApprovalQueue({ items = [] }) {
  return (
    <Panel
      title="Fila de aprovação"
      description={`${items.length} ${items.length === 1 ? "conteúdo aguardando" : "conteúdos aguardando"} revisão`}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-5 py-8 text-center">
          <CheckCircle2 className="mb-2 h-5 w-5 text-brand" strokeWidth={1.8} />
          <p className="text-[12.5px] font-semibold">Nada pendente por aqui</p>
          <p className="mt-1 max-w-[30ch] text-[11.5px] leading-relaxed text-muted-foreground">
            Nenhum conteúdo sem aprovação. Publicações só avançam com revisão manual.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {platformLabel(item.platform)} · {relativeTime(item.created_date)}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                Revisar
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}