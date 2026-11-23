import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { POST_STATUSES, statusLabel } from "@/lib/constants";
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

export default function PostsByStatusChart({ data = [] }) {
  const rows = data
    .filter((row) => row.count > 0)
    .map((row) => ({
      name: statusLabel(row.status),
      count: row.count,
      color: POST_STATUSES.find((status) => status.value === row.status)?.color,
    }));

  return (
    <Panel title="Publicações por status" description="Todas as plataformas">
      {rows.length === 0 ? (
        <EmptyChart
          title="Nenhuma publicação ainda"
          description="Os conteúdos criados no estúdio aparecem aqui conforme avançam no fluxo de aprovação."
        />
      ) : (
        <ResponsiveContainer width="100%" height={236}>
          <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={126}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="count" name="Publicações" radius={4} barSize={14}>
              {rows.map((row) => (
                <Cell key={row.name} fill={row.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}