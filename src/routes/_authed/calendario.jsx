import { createFileRoute } from "@tanstack/react-router";
import CalendarView from "@/components/calendar/CalendarView";

export const Route = createFileRoute("/_authed/calendario")({
  head: () => ({ meta: [{ title: "Calendário · AffiliateFlow" }] }),
  component: CalendarView,
});