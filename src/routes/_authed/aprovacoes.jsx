import { createFileRoute } from "@tanstack/react-router";
import ApprovalsView from "@/components/approvals/ApprovalsView";

export const Route = createFileRoute("/_authed/aprovacoes")({
  head: () => ({ meta: [{ title: "Aprovações · AffiliateFlow" }] }),
  component: ApprovalsView,
});