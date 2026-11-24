import { Image } from "@/components/ui/image";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ResultCard({ item, checked, onToggle }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
        checked ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/60",
      )}
    >
      <div onClick={(event) => event.stopPropagation()} className="pt-0.5">
        <Checkbox checked={checked} onCheckedChange={onToggle} aria-label={`Selecionar ${item.name}`} />
      </div>

      <Image
        src={item.image_url}
        alt={item.name}
        className="h-16 w-16 shrink-0 rounded-lg bg-muted object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug">{item.name}</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-[13.5px] font-bold">
            {item.price ? formatCurrency(item.price) : "Preço no marketplace"}
          </span>
          {item.original_price ? (
            <span className="text-[11px] text-muted-foreground line-through">
              {formatCurrency(item.original_price)}
            </span>
          ) : null}
        </div>
        {item.sold_quantity ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatNumber(item.sold_quantity)} vendidos
          </p>
        ) : null}
      </div>
    </div>
  );
}