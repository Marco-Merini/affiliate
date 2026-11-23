import { createFileRoute } from "@tanstack/react-router";
import AnalyticsView from "@/components/analytics/AnalyticsView";

export const Route = createFileRoute("/_authed/analytics")({
  head: () => ({ meta: [{ title: "Analytics · AffiliateFlow" }] }),
  component: AnalyticsView,
});