import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image } from "@/components/ui/image";
import { addPostAsset, deletePostAsset, updatePostAsset } from "@/lib/server-fns";

export default function AssetUploader({ postId, assets }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const addAsset = useServerFn(addPostAsset);
  const saveCaption = useServerFn(updatePostAsset);
  const removeAsset = useServerFn(deletePostAsset);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["post-editor", postId] });
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const { file_uri: fileUri } = await base44.integrations.Core.UploadPrivateFile({ file });
        await addAsset({ data: { post_id: postId, file_uri: fileUri } });
      }
      invalidate();
      toast.success(files.length === 1 ? "Imagem enviada." : `${files.length} imagens enviadas.`);
    } catch (error) {
      toast.error(error?.message ?? "Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const captionMutation = useMutation({
    mutationFn: ({ id, caption }) => saveCaption({ data: { id, caption } }),
    onSuccess: invalidate,
    onError: (error) => toast.error(error?.message ?? "Não foi possível salvar a legenda do slide."),
  });

  const destroy = useMutation({
    mutationFn: (id) => removeAsset({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Imagem removida.");
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível remover a imagem."),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Imagens
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Armazenadas de forma privada, visíveis apenas no painel.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
          )}
          {uploading ? "Enviando..." : "Enviar imagens"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {assets.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border px-3 py-6 text-center text-[11.5px] text-muted-foreground">
          Nenhuma imagem enviada. Envie a imagem única ou os slides do carrossel.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {assets.map((asset) => (
            <li key={asset.id} className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                {(asset.position ?? 0) + 1}
              </span>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {asset.signed_url ? (
                  <Image
                    src={asset.signed_url}
                    alt={`Slide ${(asset.position ?? 0) + 1}`}
                    className="h-full w-full"
                    fittingType="fill"
                  />
                ) : null}
              </div>
              <Input
                defaultValue={asset.caption ?? ""}
                placeholder="Texto do slide (opcional)"
                maxLength={500}
                className="h-8 text-[12px]"
                onBlur={(event) => {
                  const next = event.target.value.trim() || null;
                  if (next !== (asset.caption ?? null)) {
                    captionMutation.mutate({ id: asset.id, caption: next });
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                aria-label="Remover imagem"
                onClick={() => destroy.mutate(asset.id)}
                disabled={destroy.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}