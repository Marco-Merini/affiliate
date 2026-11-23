import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Panel from "@/components/dashboard/Panel";
import EmptyChart from "@/components/dashboard/EmptyChart";

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
  padding: "6px 10px",
};

const dayLabel = (iso) => {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
};

export default function ClicksChart({
  data = [],
  total = 0,
  title = "Cliques nos links de afiliado",
  description = "Últimos 14 dias · rastreamento próprio",
}) {
  const rows = data.map((row) => ({ ...row, label: dayLabel(row.date) }));
  const isEmpty = rows.length === 0 || rows.every((row) => !row.count);

  return (
    <Panel
      title={title}
      description={description}
      action={
        <span className="font-heading text-lg font-extrabold tabular-nums">
          {new Intl.NumberFormat("pt-BR").format(total)}
        </span>
      }
    >
      {isEmpty ? (
        <EmptyChart
          title="Sem cliques registrados"
          description="Quando seus links de afiliado começarem a circular, cada clique será contabilizado aqui."
        />
      ) : (
        <ResponsiveContainer width="100%" height={236}>
          <AreaChart data={rows} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.28} />
                <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10.5, fill: "hsl(var(--muted-foreground))" }}
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fontSize: 10.5, fill: "hsl(var(--muted-foreground))" }}
              allowDecimals={false}
            />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600 }} />
            <Area
              type="monotone"
              dataKey="count"
              name="Cliques"
              stroke="hsl(var(--brand))"
              strokeWidth={2}
              fill="url(#clicksFill)"
              activeDot={{ r: 3.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}