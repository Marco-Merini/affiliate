import { Pencil, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { hasValue } from "@/lib/catalog";

export default function CategoryCard({ category, productCount, onEdit, onToggleActive, onDelete }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Tags className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <Switch
          checked={Boolean(category.is_active)}
          onCheckedChange={(checked) => onToggleActive(category, checked)}
          aria-label="Categoria ativa"
        />
      </div>

      <p className="mt-2 truncate text-[14px] font-semibold leading-tight">{category.name}</p>

      {hasValue(category.description) ? (
        <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {category.description}
        </p>
      ) : (
        <p className="mt-1 text-[11.5px] text-muted-foreground">Sem descrição</p>
      )}

      <p className="mt-3 text-[11.5px] text-muted-foreground">
        {productCount} produto{productCount === 1 ? "" : "s"}
      </p>

      <div className="mt-auto flex items-center justify-end gap-1 pt-3">
        <Button variant="ghost" size="sm" className="h-7 text-[12px]" onClick={() => onEdit(category)}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[12px] text-destructive hover:text-destructive"
          onClick={() => onDelete(category)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </div>
  );
}