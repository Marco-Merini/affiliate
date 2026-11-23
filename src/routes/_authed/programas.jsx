import { createFileRoute } from "@tanstack/react-router";
import ProgramsView from "@/components/catalog/ProgramsView";

export const Route = createFileRoute("/_authed/programas")({
  head: () => ({ meta: [{ title: "Programas · AffiliateFlow" }] }),
  component: ProgramsView,
});