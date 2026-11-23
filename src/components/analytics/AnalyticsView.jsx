import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck2, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KpiCard from "@/components/dashboard/KpiCard";
import Panel from "@/components/dashboard/Panel";
import ClicksChart from "@/components/dashboard/ClicksChart";
import TopList from "@/components/analytics/TopList";
import MetricsPanel from "@/components/analytics/MetricsPanel";
import { platformLabel } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { getAnalytics } from "@/lib/server-fns";

export default function AnalyticsView() {
  const [days, setDays] = useState("30");
  const fetchAnalytics = useServerFn(getAnalytics);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", days],
    queryFn: () => fetchAnalytics({ data: { days: Number(days) } }),
  });

  const clicks = data?.clicks ?? { total: 0, last7: 0, inRange: 0 };
  const byPlatform = data?.byPlatform ?? [];
  const platformMax = byPlatform.reduce((max, row) => Math.max(max, row.count), 0);
  const metrics = data?.metrics ?? { records: 0, totals: {}, byPlatform: [] };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[19px] font-bold tracking-tight">Analytics</h1>
          <p className="mt-0.5 max-w-[70ch] text-[12.5px] leading-relaxed text-muted-foreground">
            Cliques reais nos seus links e o retorno das publicações. Clique não é venda: o sistema
            mede o tráfego que você envia.
          </p>
        </div>

        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="h-9 w-[150px] text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Cliques totais"
          value={clicks.total}
          hint="Desde o início do rastreamento"
          icon={MousePointerClick}
          loading={isLoading}
        />
        <KpiCard
          label="Cliques em 7 dias"
          value={clicks.last7}
          hint="Janela móvel de uma semana"
          icon={TrendingUp}
          tone="success"
          loading={isLoading}
        />
        <KpiCard
          label="Publicações publicadas"
          value={data?.posts?.published ?? 0}
          hint={`${formatNumber(data?.posts?.scheduled ?? 0)} agendadas na fila`}
          icon={CalendarCheck2}
          loading={isLoading}
        />
        <KpiCard
          label="Impressões"
          value={metrics.totals.sum_impressions ?? 0}
          hint={
            metrics.records === 0
              ? "Aguardando as APIs oficiais das plataformas"
              : "Somadas de todas as métricas coletadas"
          }
          icon={Eye}
          tone="warning"
          loading={isLoading}
        />
      </div>

      <ClicksChart
        data={data?.byDay ?? []}
        total={clicks.inRange}
        title="Cliques rastreados"
        description={`Últimos ${days} dias · rastreamento próprio`}
      />

      <div className="grid gap-3 xl:grid-cols-3">
        <Panel title="Cliques por plataforma" description="Origem registrada no clique">
          {byPlatform.length === 0 ? (
            <div className="flex h-[160px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 text-center">
              <p className="max-w-[34ch] text-[11.5px] leading-relaxed text-muted-foreground">
                Nenhum clique registrado ainda. Divulgue os links rastreados dos seus produtos.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {byPlatform.map((row) => (
                <li key={row.platform}>
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="font-medium">{platformLabel(row.platform)}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatNumber(row.count)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{
                        width: `${platformMax ? Math.max(4, Math.round((row.count / platformMax) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <TopList
          title="Produtos com mais cliques"
          description="Top 5 no período completo"
          items={(data?.topProducts ?? []).map((item) => ({
            id: item.id,
            label: item.name,
            value: item.clicks,
          }))}
          emptyText="Ainda sem cliques por produto. Cadastre links rastreados para começar."
        />

        <TopList
          title="Links mais clicados"
          description="Top 5 no período completo"
          items={(data?.topLinks ?? []).map((item) => ({
            id: item.id,
            label: item.label,
            sublabel: item.product,
            value: item.clicks,
          }))}
          emptyText="Nenhum link recebeu cliques ainda."
        />
      </div>

      <MetricsPanel metrics={metrics} />
    </div>
  );
}