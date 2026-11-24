import { Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import { formatDate } from "@/lib/format";

export default function ArticleCard({ article }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: article.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[16/9] overflow-hidden bg-muted">
        <Image
          src={article.cover_image_url}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {article.category ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {article.category.name}
          </span>
        ) : null}
        <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug">
          {article.title}
        </h3>
        {article.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        ) : null}
        <p className="mt-auto pt-2 text-xs text-muted-foreground">
          {formatDate(article.published_at)}
        </p>
      </div>
    </Link>
  );
}