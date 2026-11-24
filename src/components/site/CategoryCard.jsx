import { Link } from "@tanstack/react-router";
import { Tag } from "lucide-react";

export default function CategoryCard({ category }) {
  return (
    <Link
      to="/categorias/$slug"
      params={{ slug: category.slug }}
      className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(27,29,34,0.08)]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
        <Tag className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block font-heading text-base font-bold tracking-[-0.01em]">
          {category.name}
        </span>
        {category.description ? (
          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-relaxed text-muted-foreground">
            {category.description}
          </span>
        ) : null}
        {typeof category.product_count === "number" ? (
          <span className="mt-1 block text-[12px] text-muted-foreground">
            {category.product_count === 1
              ? "1 produto"
              : `${category.product_count} produtos`}
          </span>
        ) : null}
      </span>
    </Link>
  );
}