import { CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { statusLabel } from "@/lib/constants";
import { POST_STATUS_CLASS, formatLabel } from "@/lib/studio";
import { relativeTime } from "@/lib/format";

const ACTION_HINT = {
  pending_approval: { icon: MessageSquare, label: "Aguardando sua revisão" },
  changes_requested: { icon: MessageSquare, label: "Alterações solicitadas" },
  rejected: { icon: XCircle, label: "Reprovada" },
  approved: { icon: CheckCircle2, label: "Aprovada" },
  scheduled: { icon: CheckCircle2, label: "Agendada" },
};

export default function ApprovalCard({ post, campaignName, onReview }) {
  const hint = ACTION_HINT[post.status] ?? ACTION_HINT.pending_approval;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/25">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold leading-tight">{post.title}</p>
          <p className="mt-1 truncate text-[11.5px] text-muted-foreground">
            {campaignName ?? "Sem campanha"} · {formatLabel(post.format)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`shrink-0 rounded-md px-1.5 py-0 text-[10px] font-semibold ${POST_STATUS_CLASS[post.status] ?? ""}`}
        >
          {statusLabel(post.status)}
        </Badge>
      </div>

      {post.review_note && (
        <p className="mt-2 line-clamp-2 rounded-lg border border-border bg-muted/50 px-2 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
          {post.review_note}
        </p>
      )}

      <div className="mt-2.5 flex items-center gap-2 border-t border-border pt-2.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <hint.icon className="h-3 w-3" />
          {hint.label}
        </span>
        <span className="ml-auto">v{post.version ?? 1}</span>
        <span>·</span>
        <span>{relativeTime(post.reviewed_at ?? post.updated_date)}</span>
      </div>

      <Button size="sm" variant="outline" className="mt-2.5 w-full" onClick={() => onReview(post)}>
        Revisar publicação
      </Button>
    </div>
  );
}