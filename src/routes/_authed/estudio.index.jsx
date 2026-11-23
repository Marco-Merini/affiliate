import { createFileRoute } from "@tanstack/react-router";
import StudioView from "@/components/studio/StudioView";

export const Route = createFileRoute("/_authed/estudio/")({
  head: () => ({ meta: [{ title: "Estúdio de conteúdo · AffiliateFlow" }] }),
  component: StudioView,
});