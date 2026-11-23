import { CalendarCheck2, CheckCircle2, Megaphone, Package } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import PostsByStatusChart from "@/components/dashboard/PostsByStatusChart";
import ClicksChart from "@/components/dashboard/ClicksChart";
import TodayPanel from "@/components/dashboard/TodayPanel";
import ApprovalQueue from "@/components/dashboard/ApprovalQueue";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useAuth } from "@/lib/AuthContext";
import { formatLongDate, greeting } from "@/lib/format";

export default function DashboardView({ data, isDemo = false }) {
  const { user } = useAuth();
  const firstName = (user?.full_name || "").trim().split(" ")[0];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {formatLongDate()}
          </p>
          <h2 className="mt-1.5 font-heading text-[24px] font-extrabold tracking-tight sm:text-[28px]">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}.
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Produtos, campanhas e publicações da sua operação de afiliados.
          </p>
        </div>
        <span className="w-fit rounded-full border border-border bg-card px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          Fase 1 · Fundação
        </span>
      </header>

      {isDemo ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-[11.5px] text-amber-800 dark:text-amber-300">
          Prévia com números de demonstração apenas para validar o layout. Os valores reais entram assim que
          o primeiro cadastro for feito.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Produtos ativos"
          value={data.counts.activeProducts}
          hint="Físicos e digitais disponíveis"
          icon={Package}
        />
        <KpiCard
          label="Campanhas ativas"
          value={data.counts.activeCampaigns}
          hint="Em andamento no período"
          icon={Megaphone}
        />
        <KpiCard
          label="Aguardando aprovação"
          value={data.counts.pendingApproval}
          hint="Revisão manual obrigatória"
          icon={CheckCircle2}
          tone="warning"
        />
        <KpiCard
          label="Agendadas"
          value={data.counts.scheduled}
          hint="Com data e horário definidos"
          icon={CalendarCheck2}
          tone="success"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <PostsByStatusChart data={data.postsByStatus} />
        </div>
        <div className="lg:col-span-3">
          <ClicksChart data={data.clicksLast14} total={data.counts.clicks} />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <TodayPanel todayCount={data.todayCount} slots={data.todaySlots} />
        <ApprovalQueue items={data.approvalQueue} />
        <ActivityFeed items={data.activity} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium text-muted-foreground">Publicadas</p>
          <p className="mt-1 font-heading text-lg font-extrabold tabular-nums">{data.counts.published}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium text-muted-foreground">Falhas registradas</p>
          <p className="mt-1 font-heading text-lg font-extrabold tabular-nums">{data.counts.failed}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-border bg-card px-4 py-3 sm:col-span-1">
          <p className="text-[11px] font-medium text-muted-foreground">Cliques rastreados</p>
          <p className="mt-1 font-heading text-lg font-extrabold tabular-nums">{data.counts.clicks}</p>
        </div>
      </div>
    </div>
  );
}