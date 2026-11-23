import { createFileRoute } from "@tanstack/react-router";
import CampaignsView from "@/components/campaigns/CampaignsView";

export const Route = createFileRoute("/_authed/campanhas")({
  head: () => ({ meta: [{ title: "Campanhas · AffiliateFlow" }] }),
  component: CampaignsView,
});