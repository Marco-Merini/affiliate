import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CalendarDays, Save, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PostContentForm from "@/components/studio/PostContentForm";
import PostPreview from "@/components/studio/PostPreview";
import AssetUploader from "@/components/studio/AssetUploader";
import ConfirmDeleteDialog from "@/components/catalog/ConfirmDeleteDialog";
import { statusLabel } from "@/lib/constants";
import { POST_STATUS_CLASS, hashtagsToText, parseHashtags } from "@/lib/studio";
import { deletePost, getPostEditor, submitPostForApproval, updatePost } from "@/lib/server-fns";
import { formatDateTime } from "@/lib/format";

const fromPost = (post) => ({
  title: post.title ?? "",
  platform: post.platform ?? "instagram",
  format: post.format ?? "single_image",
  campaign_id: post.campaign_id ?? "",
  product_id: post.product_id ?? "",
  affiliate_link_id: post.affiliate_link_id ?? "",
  caption: post.caption ?? "",
  description: post.description ?? "",
  cta: post.cta ?? "",
  hashtags: hashtagsToText(post.hashtags),
  affiliate_disclosure: post.affiliate_disclosure ?? "",
});

export default function PostEditor({ postId }) {
  const [form, setForm] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchEditor = useServerFn(getPostEditor);
  const update = useServerFn(updatePost);
  const remove = useServerFn(deletePost);
  const submitForApproval = useServerFn(submitPostForApproval);

  const { data, isLoading } = useQuery({
    queryKey: ["post-editor", postId],
    queryFn: () => fetchEditor({ data: { id: postId } }),
  });

  useEffect(() => {
    if (data?.post) setForm(fromPost(data.post));
  }, [data?.post?.id]);

  const save = useMutation({
    mutationFn: (payload) => update({ data: { id: postId, ...payload } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-editor", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      toast.success("Publicação salva.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível salvar a publicação."),
  });

  const destroy = useMutation({
    mutationFn: () => remove({ data: { id: postId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      toast.success("Publicação excluída.");
      navigate({ to: "/estudio" });
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível excluir a publicação."),
  });

  const submit = useMutation({
    mutationFn: () => submitForApproval({ data: { id: postId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-editor", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["approval-counts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      toast.success("Publicação enviada para aprovação.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível enviar para aprovação."),
  });

  const handleSave = () => {
    if (!form?.title.trim()) return;
    save.mutate({
      title: form.title.trim(),
      platform: form.platform,
      format: form.format,
      campaign_id: form.campaign_id || null,
      product_id: form.product_id || null,
      affiliate_link_id: form.affiliate_link_id || null,
      caption: form.caption.trim() || null,
      description: form.description.trim() || null,
      cta: form.cta.trim() || null,
      hashtags: parseHashtags(form.hashtags),
      affiliate_disclosure: form.affiliate_disclosure.trim() || null,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-52 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[520px] animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-[420px] animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </div>
    );
  }

  if (!data?.post || !form) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-[14px] font-semibold">Publicação não encontrada</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Ela pode ter sido excluída ou não pertence à sua conta.
        </p>
        <Button asChild size="sm" variant="outline" className="mt-4">
          <Link to="/estudio">Voltar ao estúdio</Link>
        </Button>
      </div>
    );
  }

  const post = data.post;
  const product = data.products.find((item) => item.id === form.product_id) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 px-2">
          <Link to="/estudio">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Estúdio
          </Link>
        </Button>
        <Badge
          variant="outline"
          className={`rounded-md px-1.5 py-0 text-[10.5px] font-semibold ${POST_STATUS_CLASS[post.status] ?? ""}`}
        >
          {statusLabel(post.status)}
        </Badge>
        <span className="text-[11px] text-muted-foreground">versão {post.version ?? 1}</span>

        {["draft", "changes_requested", "rejected"].includes(post.status) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => submit.mutate()}
            disabled={submit.isPending}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {submit.isPending ? "Enviando..." : "Enviar para aprovação"}
          </Button>
        )}

        {post.status === "approved" && (
          <Button asChild variant="outline" size="sm">
            <Link to="/calendario">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              Agendar no calendário
            </Link>
          </Button>
        )}

        {post.status === "scheduled" && post.scheduled_for && (
          <span className="text-[11px] text-muted-foreground">
            Agendada para {formatDateTime(post.scheduled_for)}
          </span>
        )}

        {post.status === "pending_approval" && (
          <span className="text-[11px] text-muted-foreground">Aguardando revisão</span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Excluir
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!form.title.trim() || save.isPending}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {post.review_note && ["changes_requested", "rejected"].includes(post.status) && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] leading-relaxed text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Revisão: </span>
          {post.review_note}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <PostContentForm
          form={form}
          onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
          campaigns={data.campaigns}
          products={data.products}
          links={data.links}
        />

        <div className="space-y-4">
          <PostPreview form={form} product={product} assets={data.assets} />
          <AssetUploader postId={postId} assets={data.assets} />
        </div>
      </div>

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir publicação"
        description={`"${post.title}" e as imagens vinculadas serão removidas. Esta ação não pode ser desfeita.`}
        pending={destroy.isPending}
        onConfirm={() => destroy.mutate()}
      />
    </div>
  );
}