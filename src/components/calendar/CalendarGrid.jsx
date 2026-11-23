import { platformLabel } from "@/lib/constants";
import { dayKey, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export default function CalendarGrid({ month, postsByDay, selectedDay, onSelectDay }) {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const today = dayKey(new Date());

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="px-1.5 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`blank-${index}`} className="min-h-[86px] border-b border-r border-border bg-muted/20" />;
          }

          const key = `${month}-${String(day).padStart(2, "0")}`;
          const dayPosts = postsByDay[key] ?? [];
          const count = dayPosts.length;
          const isToday = key === today;
          const isSelected = key === selectedDay;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(key)}
              className={cn(
                "flex min-h-[86px] flex-col gap-1 border-b border-r border-border p-1.5 text-left align-top transition-colors hover:bg-muted/40",
                isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/40",
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-1 text-[11px] font-semibold",
                  isToday ? "text-brand" : "text-foreground",
                )}
              >
                {day}
                {count > 0 && (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      count > 5 ? "bg-amber-500" : count >= 3 ? "bg-emerald-500" : "bg-muted-foreground/50",
                    )}
                  />
                )}
              </span>

              <div className="space-y-0.5">
                {dayPosts.slice(0, 2).map((post) => (
                  <span
                    key={post.id}
                    className="block truncate rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground"
                  >
                    {formatTime(post.scheduled_for)} {platformLabel(post.platform)}
                  </span>
                ))}
                {count > 2 && (
                  <span className="block text-[9px] text-muted-foreground">+{count - 2}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}