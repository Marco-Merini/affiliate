import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Trilha de navegação" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.to && !last ? (
                <Link to={item.to} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-foreground/80">
                  {item.label}
                </span>
              )}
              {last ? null : <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}