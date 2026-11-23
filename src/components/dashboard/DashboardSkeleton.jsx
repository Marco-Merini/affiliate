export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="space-y-2">
        <div className="h-3 w-40 rounded bg-muted" />
        <div className="h-7 w-64 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[104px] rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-5">
        <div className="h-[300px] rounded-xl border border-border bg-card lg:col-span-2" />
        <div className="h-[300px] rounded-xl border border-border bg-card lg:col-span-3" />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[220px] rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}