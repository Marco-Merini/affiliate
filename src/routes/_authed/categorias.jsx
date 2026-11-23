import { createFileRoute } from "@tanstack/react-router";
import CategoriesView from "@/components/catalog/CategoriesView";

export const Route = createFileRoute("/_authed/categorias")({
  head: () => ({ meta: [{ title: "Categorias · AffiliateFlow" }] }),
  component: CategoriesView,
});