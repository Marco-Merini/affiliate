import { Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import { formatDate } from "@/lib/format";

export default function ArticleCard({ article }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: article.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(27,29,34,0.08)]"
    >
      <div className="aspect-[16/9] overflow-hidden bg-accent">
        <Image
          src={article.cover_image_url}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {article.category ? (
          <span className="w-fit rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
            {article.category.name}
          </span>
        ) : null}
        <h3 className="line-clamp-2 font-heading text-[17px] font-bold leading-snug tracking-[-0.01em]">
          {article.title}
        </h3>
        {article.excerpt ? (
          <p className="line-clamp-2 text-[13.5px] leading-relaxed text-muted-foreground">
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