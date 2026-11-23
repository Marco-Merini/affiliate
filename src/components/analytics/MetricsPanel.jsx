import Panel from "@/components/dashboard/Panel";
import { platformLabel } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

const COLUMNS = [
  { key: "sum_impressions", label: "Impressões" },
  { key: "sum_reach", label: "Alcance" },
  { key: "sum_likes", label: "Curtidas" },
  { key: "sum_comments", label: "Comentários" },
  { key: "sum_shares", label: "Compart." },
  { key: "sum_saves", label: "Salvos" },
];

export default function MetricsPanel({ metrics }) {
  return (
    <Panel
      title="Métricas das plataformas"
      description="Impressões, alcance e engajamento informados pelas próprias plataformas"
    >
      {metrics.records === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-8 text-center">
          <p className="text-[12.5px] font-semibold">Nenhuma métrica coletada</p>
          <p className="mt-1 max-w-[52ch] text-[11.5px] leading-relaxed text-muted-foreground">
            Esses números só existem quando as contas sociais estão conectadas pelas APIs oficiais
            das plataformas. A coleta entra junto com as integrações da Fase 5.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-border text-left text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Plataforma</th>
                {COLUMNS.map((column) => (
                  <th key={column.key} className="py-2 pr-3 text-right font-semibold">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.byPlatform.map((row) => (
                <tr key={row.platform} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3 font-medium">{platformLabel(row.platform)}</td>
                  {COLUMNS.map((column) => (
                    <td key={column.key} className="py-2 pr-3 text-right tabular-nums">
                      {formatNumber(row[column.key] ?? 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}