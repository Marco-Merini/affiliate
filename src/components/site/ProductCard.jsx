import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Image } from "@/components/ui/image";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ProductCard({ product }) {
  const price = Number(product.current_price) > 0 ? formatCurrency(product.current_price) : null;
  const previous =
    Number(product.previous_price) > 0 ? formatCurrency(product.previous_price) : null;
  const rating = Number(product.rating) > 0 ? Number(product.rating) : null;
  const params = { slug: product.slug };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(27,29,34,0.08)]">
      <Link to="/produtos/$slug" params={params} className="relative block aspect-square bg-card p-4">
        <Image
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          fittingType="fit"
          className="h-full w-full object-contain"
        />
        {product.discount ? (
          <span className="absolute left-3 top-3 rounded-md bg-destructive/10 px-2 py-0.5 text-[12px] font-bold text-destructive">
            -{product.discount}%
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4">
        {product.category ? (
          <span className="w-fit rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
            {product.category.name}
          </span>
        ) : null}

        <Link to="/produtos/$slug" params={params}>
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-foreground">
            {product.name}
          </h3>
        </Link>

        {rating ? (
          <div className="flex items-center gap-1 text-[13px]">
            <Star className="h-3.5 w-3.5 fill-[#F5A524] text-[#F5A524]" aria-hidden="true" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            {Number(product.review_count) > 0 ? (
              <span className="text-muted-foreground">({formatNumber(product.review_count)})</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto pt-2">
          {previous ? (
            <span className="block text-[13px] text-muted-foreground line-through">{previous}</span>
          ) : null}
          <span
            className={cn(
              "block font-heading text-[22px] font-extrabold tracking-[-0.02em]",
              product.discount ? "text-destructive" : "text-foreground",
            )}
          >
            {price ?? "Ver preço"}
          </span>
        </div>

        <Link
          to="/produtos/$slug"
          params={params}
          className={cn(buttonVariants(), "mt-2 h-11 w-full rounded-full text-[13px]")}
        >
          Ver oferta
        </Link>
      </div>
    </article>
  );
}