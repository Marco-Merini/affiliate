import { createFileRoute } from "@tanstack/react-router";
import SettingsView from "@/components/settings/SettingsView";

export const Route = createFileRoute("/_authed/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações · AffiliateFlow" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return <SettingsView />;
}