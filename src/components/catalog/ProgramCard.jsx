import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  PROGRAM_PLATFORM_CLASS,
  formatPercent,
  hasValue,
  programPlatformLabel,
} from "@/lib/catalog";
import { safeHttpUrl } from "@/lib/seo";

export default function ProgramCard({ program, productCount, onEdit, onToggleActive, onDelete }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <Badge
          variant="outline"
          className={`rounded-md px-1.5 py-0 text-[10.5px] font-semibold ${PROGRAM_PLATFORM_CLASS[program.platform] ?? ""}`}
        >
          {programPlatformLabel(program.platform)}
        </Badge>
        <Switch
          checked={Boolean(program.is_active)}
          onCheckedChange={(checked) => onToggleActive(program, checked)}
          aria-label="Programa ativo"
        />
      </div>

      <p className="mt-2 truncate text-[14px] font-semibold leading-tight">{program.name}</p>

      {safeHttpUrl(program.website_url) ? (
        <a
          href={safeHttpUrl(program.website_url)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 truncate text-[11.5px] text-muted-foreground hover:text-primary"
        >
          <span className="truncate">{program.website_url}</span>
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ) : (
        <p className="mt-1 text-[11.5px] text-muted-foreground">Sem site informado</p>
      )}

      <div className="mt-3 flex items-center gap-3 text-[11.5px] text-muted-foreground">
        <span>
          {productCount} produto{productCount === 1 ? "" : "s"}
        </span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span>Comissão padrão {formatPercent(program.default_commission)}</span>
      </div>

      {hasValue(program.notes) && (
        <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {program.notes}
        </p>
      )}

      <div className="mt-auto flex items-center justify-end gap-1 pt-3">
        <Button variant="ghost" size="sm" className="h-7 text-[12px]" onClick={() => onEdit(program)}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[12px] text-destructive hover:text-destructive"
          onClick={() => onDelete(program)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </div>
  );
}