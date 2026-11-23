import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import DashboardView from "@/components/dashboard/DashboardView";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DashboardError from "@/components/dashboard/DashboardError";
import { getDashboardOverview } from "@/lib/server-fns";

export const Route = createFileRoute("/_authed/")({
  head: () => ({ meta: [{ title: "Dashboard · AffiliateFlow" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchOverview = useServerFn(getDashboardOverview);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => fetchOverview({ data: {} }),
    staleTime: 30000,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) return <DashboardError onRetry={() => refetch()} />;

  return <DashboardView data={data} />;
}