import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import ScheduleDialog from "@/components/calendar/ScheduleDialog";
import { PLATFORMS, platformLabel, statusLabel } from "@/lib/constants";
import { POST_STATUS_CLASS } from "@/lib/studio";
import { dayKey, formatTime, monthKey } from "@/lib/format";
import { getCalendar, unschedulePost } from "@/lib/server-fns";

const monthLabel = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

const shiftMonth = (month, delta) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const next = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
};

export default function CalendarView() {
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [platform, setPlatform] = useState("all");
  const [selectedDay, setSelectedDay] = useState(() => dayKey(new Date()));
  const [scheduling, setScheduling] = useState(null);

  const queryClient = useQueryClient();
  const fetchCalendar = useServerFn(getCalendar);
  const unschedule = useServerFn(unschedulePost);

  const { data, isLoading } = useQuery({
    queryKey: ["calendar", { month, platform }],
    queryFn: () =>
      fetchCalendar({
        data: { month, platform: platform === "all" ? undefined : platform },
      }),
  });

  const items = data?.items ?? [];
  const ready = data?.ready ?? [];

  const postsByDay = useMemo(() => {
    const grouped = {};
    items.forEach((post) => {
      if (!post.scheduled_for) return;
      const key = dayKey(post.scheduled_for);
      grouped[key] = [...(grouped[key] ?? []), post];
    });
    return grouped;
  }, [items]);

  const selectedPosts = postsByDay[selectedDay] ?? [];

  const cancelSchedule = useMutation({
    mutationFn: (id) => unschedule({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["approval-counts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      toast.success("Agendamento cancelado.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível cancelar o agendamento."),
  });

  const busiest = useMemo(
    () =>
      Object.values(postsByDay).reduce((max, list) => Math.max(max, list.length), 0),
    [postsByDay],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[19px] font-bold tracking-tight">Calendário</h1>
          <p className="mt-0.5 max-w-[70ch] text-[12.5px] leading-relaxed text-muted-foreground">
            Agende as publicações aprovadas no ritmo de 3 a 5 por dia. A fila executa no horário
            definido.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mês anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[132px] text-center text-[12.5px] font-semibold capitalize">
            {monthLabel(month)}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Próximo mês">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="h-9 w-[180px] text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as plataformas</SelectItem>
            {PLATFORMS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" onClick={() => { setMonth(monthKey(new Date())); setSelectedDay(dayKey(new Date())); }}>
          Hoje
        </Button>

        <p className="text-[11.5px] text-muted-foreground">
          {items.length} publicação{items.length === 1 ? "" : "ões"} no mês · dia mais cheio: {busiest}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {isLoading ? (
            <div className="h-[520px] animate-pulse rounded-xl border border-border bg-card" />
          ) : (
            <CalendarGrid
              month={month}
              postsByDay={postsByDay}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {selectedDay.split("-").reverse().join("/")}
            </p>

            {selectedPosts.length === 0 ? (
              <p className="mt-2 text-[11.5px] text-muted-foreground">
                Nada agendado neste dia. Use a lista de aprovadas para ocupar o horário.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {selectedPosts.map((post) => (
                  <li key={post.id} className="rounded-lg border border-border p-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
                        <Clock className="h-3 w-3" />
                        {formatTime(post.scheduled_for)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`ml-auto rounded-md px-1.5 py-0 text-[9.5px] font-semibold ${POST_STATUS_CLASS[post.status] ?? ""}`}
                      >
                        {statusLabel(post.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-[12px] font-medium">{post.title}</p>
                    <p className="text-[10.5px] text-muted-foreground">
                      {platformLabel(post.platform)}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Button asChild variant="ghost" size="sm" className="h-6 px-1.5 text-[11px]">
                        <Link to="/estudio/$postId" params={{ postId: post.id }}>
                          Abrir
                        </Link>
                      </Button>
                      {post.status === "scheduled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[11px] text-destructive hover:text-destructive"
                          onClick={() => cancelSchedule.mutate(post.id)}
                          disabled={cancelSchedule.isPending}
                        >
                          Desagendar
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Prontas para agendar
              </p>
            </div>

            {ready.length === 0 ? (
              <p className="mt-2 text-[11.5px] text-muted-foreground">
                Nenhuma publicação aprovada aguardando horário.
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {ready.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-medium">{post.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {platformLabel(post.platform)} · v{post.version ?? 1}
                      </p>
                    </div>
                    <Button size="sm" className="h-6 px-2 text-[11px]" onClick={() => setScheduling(post)}>
                      Agendar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ScheduleDialog
        open={Boolean(scheduling)}
        onOpenChange={(open) => !open && setScheduling(null)}
        post={scheduling}
        defaultDay={selectedDay}
      />
    </div>
  );
}