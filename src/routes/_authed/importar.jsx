import { createFileRoute } from "@tanstack/react-router";
import MercadoLivreImportView from "@/components/marketplace/MercadoLivreImportView";

export const Route = createFileRoute("/_authed/importar")({
  validateSearch: (search) => ({
    ml: typeof search.ml === "string" ? search.ml : undefined,
  }),
  head: () => ({ meta: [{ title: "Importar do Mercado Livre · AffiliateFlow" }] }),
  component: ImportPage,
});

function ImportPage() {
  const { ml } = Route.useSearch();
  return <MercadoLivreImportView mlStatus={ml} />;
}