import { createFileRoute } from "@tanstack/react-router";
import OpportunitiesView from "@/components/opportunity/OpportunitiesView";

export const Route = createFileRoute("/_authed/oportunidades")({
  head: () => ({ meta: [{ title: "Oportunidades · AffiliateFlow" }] }),
  component: OpportunitiesView,
});