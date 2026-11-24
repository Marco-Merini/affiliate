import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import SeoView from "@/components/seo/SeoView";
import { getSeoWorkspace } from "@/lib/seo-fns";

export const Route = createFileRoute("/_authed/seo")({
  head: () => ({ meta: [{ title: "SEO e Google · AffiliateFlow" }] }),
  component: SeoPage,
});

function SeoPage() {
  const fetchWorkspace = useServerFn(getSeoWorkspace);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["seo-workspace"],
    queryFn: () => fetchWorkspace({ data: {} }),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-[520px] w-full" />
          <Skeleton className="h-[360px] w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm">
        <p className="font-medium">Não foi possível carregar as configurações de SEO.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return <SeoView workspace={data} />;
}