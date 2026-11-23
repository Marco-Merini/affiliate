import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, MessageSquare, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PostPreview from "@/components/studio/PostPreview";
import { statusLabel } from "@/lib/constants";
import { POST_STATUS_CLASS, hashtagsToText } from "@/lib/studio";
import {
  approvePost,
  getPostEditor,
  rejectPost,
  requestPostChanges,
  submitPostForApproval,
} from "@/lib/server-fns";

export default function ReviewDialog({ open, onOpenChange, post }) {
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();
  const fetchEditor = useServerFn(getPostEditor);
  const approve = useServerFn(approvePost);
  const askChanges = useServerFn(requestPostChanges);
  const reject = useServerFn(rejectPost);
  const resubmit = useServerFn(submitPostForApproval);

  const { data, isLoading } = useQuery({
    queryKey: ["post-editor", post?.id],
    queryFn: () => fetchEditor({ data: { id: post.id } }),
    enabled: open && Boolean(post?.id),
  });

  useEffect(() => {
    if (open) setNote("");
  }, [open, post?.id]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["post-editor", post?.id] });
    queryClient.invalidateQueries({ queryKey: ["approvals"] });
    queryClient.invalidateQueries({ queryKey: ["approval-counts"] });
    queryClient.invalidateQueries({ queryKey: ["calendar"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
  };

  const finish = (message) => {
    invalidate();
    toast.success(message);
    onOpenChange(false);
  };

  const approveMutation = useMutation({
    mutationFn: () => approve({ data: { id: post.id, note: note.trim() || null } }),
    onSuccess: () => finish("Publicação aprovada."),
    onError: (error) => toast.error(error?.message ?? "Não foi possível aprovar."),
  });

  const changesMutation = useMutation({
    mutationFn: () => askChanges({ data: { id: post.id, note: note.trim() } }),
    onSuccess: () => finish("Alterações solicitadas."),
    onError: (error) => toast.error(error?.message ?? "Não foi possível solicitar alterações."),
  });

  const rejectMutation = useMutation({
    mutationFn: () => reject({ data: { id: post.id, note: note.trim() } }),
    onSuccess: () => finish("Publicação reprovada."),
    onError: (error) => toast.error(error?.message ?? "Não foi possível reprovar."),
  });

  const resubmitMutation = useMutation({
    mutationFn: () => resubmit({ data: { id: post.id } }),
    onSuccess: () => finish("Publicação reenviada para aprovação."),
    onError: (error) => toast.error(error?.message ?? "Não foi possível reenviar."),
  });

  const current = data?.post ?? post;
  const pending = current?.status === "pending_approval";
  const canResubmit = ["changes_requested", "rejected"].includes(current?.status);
  const busy =
    approveMutation.isPending ||
    changesMutation.isPending ||
    rejectMutation.isPending ||
    resubmitMutation.isPending;

  const product = data?.products?.find((item) => item.id === current?.product_id) ?? null;
  const previewForm = current
    ? {
        platform: current.platform,
        format: current.format,
        caption: current.caption ?? "",
        cta: current.cta ?? "",
        hashtags: hashtagsToText(current.hashtags),
        affiliate_disclosure: current.affiliate_disclosure ?? "",
      }
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="pr-6 text-left">{current?.title ?? "Revisão"}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 text-left">
            <Badge
              variant="outline"
              className={`rounded-md px-1.5 py-0 text-[10px] font-semibold ${POST_STATUS_CLASS[current?.status] ?? ""}`}
            >
              {statusLabel(current?.status)}
            </Badge>
            <span>versão {current?.version ?? 1}</span>
            {current?.approved_version ? <span>· aprovada na v{current.approved_version}</span> : null}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !previewForm ? (
          <div className="h-[320px] animate-pulse rounded-xl bg-muted" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Conteúdo
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed">
                  {current.caption || "Sem legenda."}
                </p>
                {current.cta && (
                  <p className="mt-2 text-[12px] font-semibold">CTA: {current.cta}</p>
                )}
                {(current.hashtags ?? []).length > 0 && (
                  <p className="mt-1 text-[11.5px] text-sky-600 dark:text-sky-400">
                    {hashtagsToText(current.hashtags)}
                  </p>
                )}
                {current.affiliate_disclosure && (
                  <p className="mt-2 text-[10.5px] text-muted-foreground">
                    {current.affiliate_disclosure}
                  </p>
                )}
                {current.description && (
                  <p className="mt-2 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {current.description}
                  </p>
                )}
              </div>

              {current.review_note && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11.5px] leading-relaxed text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">Última revisão: </span>
                  {current.review_note}
                </div>
              )}

              {(pending || canResubmit) && (
                <div className="space-y-1.5">
                  <p className="text-[11.5px] font-medium">
                    Observação da revisão{" "}
                    <span className="font-normal text-muted-foreground">
                      {pending ? "(necessária para pedir alterações ou reprovar)" : "(opcional)"}
                    </span>
                  </p>
                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="O que precisa mudar antes de publicar?"
                  />
                </div>
              )}
            </div>

            <PostPreview form={previewForm} product={product} assets={data?.assets ?? []} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/estudio/$postId" params={{ postId: current?.id }} onClick={() => onOpenChange(false)}>
              Abrir no estúdio
            </Link>
          </Button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {pending && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => rejectMutation.mutate()}
                  disabled={busy || note.trim().length < 3}
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Reprovar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changesMutation.mutate()}
                  disabled={busy || note.trim().length < 3}
                >
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  Solicitar alterações
                </Button>
                <Button size="sm" onClick={() => approveMutation.mutate()} disabled={busy}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Aprovar
                </Button>
              </>
            )}

            {canResubmit && (
              <Button size="sm" onClick={() => resubmitMutation.mutate()} disabled={busy}>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Reenviar para aprovação
              </Button>
            )}

            {!pending && !canResubmit && (
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}