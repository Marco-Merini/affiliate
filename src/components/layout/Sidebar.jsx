import { Link, useRouterState } from "@tanstack/react-router";
import { NAV_GROUPS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
          <path
            d="M5 17.5 12 6.5l7 11"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand ring-2 ring-sidebar" />
      </div>
      <div className="leading-tight">
        <p className="font-heading text-[15px] font-extrabold tracking-tight">AffiliateFlow</p>
        <p className="text-[11px] text-muted-foreground">Painel do afiliado</p>
      </div>
    </div>
  );
}

export default function Sidebar({ onNavigate }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside className="flex h-full w-[264px] shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="py-6">
        <Brand />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                if (!item.to) {
                  return (
                    <li key={item.label}>
                      <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground/60">
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                        <span className="flex-1 truncate">{item.label}</span>
                        <span className="rounded border border-border px-1 py-px text-[9px] font-semibold uppercase tracking-wide">
                          F{item.phase}
                        </span>
                      </div>
                    </li>
                  );
                }
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-xl bg-muted/70 p-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-semibold text-foreground">MVP · Fase 3</p>
            <span className="text-[10px] text-muted-foreground">de 6</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-brand" style={{ width: "50%" }} />
          </div>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            Campanhas e estúdio de conteúdo em operação.
          </p>
        </div>
      </div>
    </aside>
  );
}