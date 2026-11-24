import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Image } from "@/components/ui/image";
import { formatCurrency, formatNumber } from "@/lib/format";

export default function ProductCard({ product }) {
  const price = Number(product.current_price) > 0 ? formatCurrency(product.current_price) : null;
  const previous =
    Number(product.previous_price) > 0 ? formatCurrency(product.previous_price) : null;
  const rating = Number(product.rating) > 0 ? Number(product.rating) : null;

  return (
    <Link
      to="/produtos/$slug"
      params={{ slug: product.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {product.discount ? (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white">
            -{product.discount}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {product.category.name}
          </span>
        ) : null}

        <h3 className="line-clamp-2 font-heading text-sm font-semibold leading-snug">
          {product.name}
        </h3>

        {rating ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
            {Number(product.review_count) > 0 ? (
              <span>({formatNumber(product.review_count)})</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-1">
          {price ? (
            <span className="font-heading text-lg font-bold">{price}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Preço no marketplace</span>
          )}
          {previous ? (
            <span className="text-xs text-muted-foreground line-through">{previous}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}