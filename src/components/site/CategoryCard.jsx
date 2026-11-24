import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export default function CategoryCard({ category }) {
  return (
    <Link
      to="/categorias/$slug"
      params={{ slug: category.slug }}
      className="group flex flex-col gap-1 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-muted/50"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-heading text-sm font-semibold">{category.name}</span>
        <ArrowUpRight
          className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      </span>
      {category.description ? (
        <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {category.description}
        </span>
      ) : null}
    </Link>
  );
}