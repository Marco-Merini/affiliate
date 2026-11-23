import {
  Archive,
  ExternalLink,
  MoreHorizontal,
  Package,
  PauseCircle,
  Pencil,
  PlayCircle,
  Target,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Image } from "@/components/ui/image";
import ScoreBadge from "@/components/opportunity/ScoreBadge";
import {
  PRODUCT_STATUS_CLASS,
  PRODUCT_TYPE_CLASS,
  formatPercent,
  hasValue,
  productStatusLabel,
  productTypeLabel,
} from "@/lib/catalog";
import { formatCurrency, relativeTime } from "@/lib/format";

export default function ProductCard({
  product,
  programName,
  categoryName,
  onEdit,
  onChangeStatus,
  onDelete,
  onAnalyze,
}) {
  return (
    <div className="flex gap-3.5 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/25">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            className="h-full w-full"
            fittingType="fill"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground" strokeWidth={1.7} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold leading-tight">{product.name}</p>
            <p className="mt-1 truncate text-[11.5px] text-muted-foreground">
              {programName ?? "Sem programa"} · {categoryName ?? "Sem categoria"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {hasValue(product.affiliate_url) && (
              <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                <a
                  href={product.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir link de afiliado"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Ações do produto">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
                {product.status === "active" ? (
                  <DropdownMenuItem onClick={() => onChangeStatus(product, "paused")}>
                    <PauseCircle className="mr-2 h-3.5 w-3.5" />
                    Pausar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onChangeStatus(product, "active")}>
                    <PlayCircle className="mr-2 h-3.5 w-3.5" />
                    Ativar
                  </DropdownMenuItem>
                )}
                {product.status !== "archived" && (
                  <DropdownMenuItem onClick={() => onChangeStatus(product, "archived")}>
                    <Archive className="mr-2 h-3.5 w-3.5" />
                    Arquivar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAnalyze(product)}>
                  <Target className="mr-2 h-3.5 w-3.5" />
                  Analisar oportunidade
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(product)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <Badge
            variant="outline"
            className={`rounded-md px-1.5 py-0 text-[10.5px] font-semibold ${PRODUCT_STATUS_CLASS[product.status] ?? ""}`}
          >
            {productStatusLabel(product.status)}
          </Badge>
          <ScoreBadge score={product.opportunity_score} />
          <Badge
            variant="outline"
            className={`rounded-md px-1.5 py-0 text-[10.5px] font-medium ${PRODUCT_TYPE_CLASS[product.type] ?? ""}`}
          >
            {productTypeLabel(product.type)}
          </Badge>

          {hasValue(product.current_price) && (
            <span className="text-[12.5px] font-semibold">
              {formatCurrency(product.current_price)}
              {hasValue(product.previous_price) &&
                Number(product.previous_price) > Number(product.current_price) && (
                  <span className="ml-1.5 font-normal text-muted-foreground line-through">
                    {formatCurrency(product.previous_price)}
                  </span>
                )}
            </span>
          )}

          {hasValue(product.commission_percent) && (
            <span className="text-[11.5px] text-muted-foreground">
              Comissão {formatPercent(product.commission_percent)}
            </span>
          )}
        </div>

        {hasValue(product.price_checked_at) && (
          <p className="mt-1.5 text-[10.5px] text-muted-foreground">
            Preço conferido {relativeTime(product.price_checked_at)}
          </p>
        )}
      </div>
    </div>
  );
}