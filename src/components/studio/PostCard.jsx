import { Link } from "@tanstack/react-router";
import { ImageIcon, MoreHorizontal, PenLine, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Image } from "@/components/ui/image";
import { platformLabel, statusLabel } from "@/lib/constants";
import { POST_STATUS_CLASS, formatLabel } from "@/lib/studio";
import { relativeTime } from "@/lib/format";

export default function PostCard({ post, campaignName, onDelete }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/25">
      <Link
        to="/estudio/$postId"
        params={{ postId: post.id }}
        className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {post.thumbnail_url ? (
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              className="h-full w-full"
              fittingType="fill"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" strokeWidth={1.6} />
            </div>
          )}
          <span className="absolute left-2 top-2 rounded border border-border bg-card/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
            {platformLabel(post.platform)} · {formatLabel(post.format)}
          </span>
        </div>

        <div className="p-3">
          <p className="truncate pr-8 text-[13px] font-semibold leading-tight">{post.title}</p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {campaignName ?? "Sem campanha"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={`rounded-md px-1.5 py-0 text-[10px] font-semibold ${POST_STATUS_CLASS[post.status] ?? ""}`}
            >
              {statusLabel(post.status)}
            </Badge>
            <span className="text-[10.5px] text-muted-foreground">v{post.version ?? 1}</span>
            {post.asset_count > 0 && (
              <span className="text-[10.5px] text-muted-foreground">
                · {post.asset_count} imagem{post.asset_count === 1 ? "" : "s"}
              </span>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground">
              {relativeTime(post.updated_date)}
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute right-2 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 border border-border"
              aria-label="Ações da publicação"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link to="/estudio/$postId" params={{ postId: post.id }}>
                <PenLine className="mr-2 h-3.5 w-3.5" />
                Abrir editor
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(post)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}