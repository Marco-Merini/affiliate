import { CalendarClock } from "lucide-react";
import Panel from "@/components/dashboard/Panel";

const DAILY_MIN = 3;
const DAILY_MAX = 5;

export default function TodayPanel({ todayCount = 0, slots = [] }) {
  const percent = Math.min(Math.round((todayCount / DAILY_MAX) * 100), 100);
  const withinRange = todayCount >= DAILY_MIN && todayCount <= DAILY_MAX;

  return (
    <Panel
      title="Ritmo de hoje"
      description={`Meta de ${DAILY_MIN} a ${DAILY_MAX} publicações somando todos os canais`}
    >
      <div className="flex items-baseline gap-1.5">
        <span className="font-heading text-2xl font-extrabold leading-none">{todayCount}</span>
        <span className="text-[12px] text-muted-foreground">de {DAILY_MIN}–{DAILY_MAX} previstas</span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={withinRange ? "h-full rounded-full bg-brand" : "h-full rounded-full bg-primary"}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {withinRange
          ? "Ritmo dentro do planejado para o dia."
          : `Faltam ${Math.max(DAILY_MIN - todayCount, 0)} publicações para atingir o mínimo diário.`}
      </p>

      <div className="mt-4 space-y-2">
        {slots.length === 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-dashed border-border px-3 py-2.5">
            <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-[11.5px] leading-snug text-muted-foreground">
              Nenhum horário definido para hoje. O agendamento entra na Fase 4.
            </p>
          </div>
        ) : (
          slots.map((slot) => (
            <div
              key={slot.time}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
            >
              <span className="font-mono text-[11px] font-semibold tabular-nums">{slot.time}</span>
              <span className="truncate text-[11.5px] text-muted-foreground">{slot.title}</span>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}