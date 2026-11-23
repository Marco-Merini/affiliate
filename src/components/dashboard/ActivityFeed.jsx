import { Activity } from "lucide-react";
import Panel from "@/components/dashboard/Panel";
import { relativeTime } from "@/lib/format";

export default function ActivityFeed({ items = [] }) {
  return (
    <Panel title="Atividade recente" description="Registro do que mudou no painel">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-5 py-8 text-center">
          <Activity className="mb-2 h-5 w-5 text-muted-foreground" strokeWidth={1.8} />
          <p className="text-[12.5px] font-semibold">Nenhuma atividade registrada</p>
          <p className="mt-1 max-w-[30ch] text-[11.5px] leading-relaxed text-muted-foreground">
            Cada cadastro, aprovação e publicação fica registrado aqui com data e hora.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <div className="min-w-0">
                <p className="text-[12.5px] leading-snug">{item.description}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{relativeTime(item.created_date)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}