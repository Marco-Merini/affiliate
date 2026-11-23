import { createFileRoute } from "@tanstack/react-router";
import ProductsView from "@/components/catalog/ProductsView";

export const Route = createFileRoute("/_authed/produtos")({
  head: () => ({ meta: [{ title: "Produtos · AffiliateFlow" }] }),
  component: ProductsView,
});