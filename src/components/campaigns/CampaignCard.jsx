import {
  CalendarRange,
  Megaphone,
  MoreHorizontal,
  PauseCircle,
  Pencil,
  PlayCircle,
  StopCircle,
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
import {
  CAMPAIGN_STATUS_CLASS,
  campaignStatusLabel,
  formatCampaignPeriod,
  objectiveLabel,
} from "@/lib/campaign";
import { platformLabel } from "@/lib/constants";
import { relativeTime } from "@/lib/format";

export default function CampaignCard({
  campaign,
  productName,
  postCount,
  onEdit,
  onChangeStatus,
  onDelete,
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/25">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold leading-tight">{campaign.name}</p>
          <p className="mt-1 truncate text-[11.5px] text-muted-foreground">
            {productName ?? "Sem produto vinculado"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Ações da campanha">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(campaign)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            {campaign.status !== "active" && campaign.status !== "finished" && (
              <DropdownMenuItem onClick={() => onChangeStatus(campaign, "active")}>
                <PlayCircle className="mr-2 h-3.5 w-3.5" />
                Ativar
              </DropdownMenuItem>
            )}
            {campaign.status === "active" && (
              <DropdownMenuItem onClick={() => onChangeStatus(campaign, "paused")}>
                <PauseCircle className="mr-2 h-3.5 w-3.5" />
                Pausar
              </DropdownMenuItem>
            )}
            {campaign.status !== "finished" && campaign.status !== "cancelled" && (
              <DropdownMenuItem onClick={() => onChangeStatus(campaign, "finished")}>
                <StopCircle className="mr-2 h-3.5 w-3.5" />
                Finalizar
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(campaign)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge
          variant="outline"
          className={`rounded-md px-1.5 py-0 text-[10.5px] font-semibold ${CAMPAIGN_STATUS_CLASS[campaign.status] ?? ""}`}
        >
          {campaignStatusLabel(campaign.status)}
        </Badge>
        <Badge variant="outline" className="rounded-md px-1.5 py-0 text-[10.5px] font-medium">
          {objectiveLabel(campaign.objective)}
        </Badge>
      </div>

      {campaign.description && (
        <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {campaign.description}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1">
        {(campaign.platforms ?? []).map((platform) => (
          <span
            key={platform}
            className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            {platformLabel(platform)}
          </span>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarRange className="h-3 w-3" />
          {formatCampaignPeriod(campaign.start_date, campaign.end_date)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Megaphone className="h-3 w-3" />
          {postCount} publicação{postCount === 1 ? "" : "ões"}
        </span>
        <span className="ml-auto">{relativeTime(campaign.created_date)}</span>
      </div>
    </div>
  );
}