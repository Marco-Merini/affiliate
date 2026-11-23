import { Heart, MessageCircle, Send } from "lucide-react";
import { Image } from "@/components/ui/image";
import { ImageIcon } from "lucide-react";
import { platformLabel } from "@/lib/constants";

export default function PostPreview({ form, product, assets }) {
  const cover = assets[0]?.signed_url ?? null;
  const coverImage = cover ?? product?.image_url ?? null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        Prévia
      </p>

      <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl border border-border bg-background">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            AF
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold">affiliateflow</p>
            <p className="text-[9.5px] text-muted-foreground">{platformLabel(form.platform)}</p>
          </div>
        </div>

        <div className="aspect-square w-full bg-muted">
          {coverImage ? (
            <Image src={coverImage} alt="Prévia da publicação" className="h-full w-full" fittingType="fill" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <ImageIcon className="h-6 w-6" strokeWidth={1.6} />
              <span className="text-[10.5px]">Envie a imagem da publicação</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-b border-border px-3 py-2 text-foreground">
          <Heart className="h-3.5 w-3.5" />
          <MessageCircle className="h-3.5 w-3.5" />
          <Send className="h-3.5 w-3.5" />
        </div>

        <div className="space-y-1.5 px-3 py-2.5">
          {form.caption ? (
            <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground">
              <span className="font-semibold">affiliateflow </span>
              {form.caption}
            </p>
          ) : (
            <p className="text-[11px] italic text-muted-foreground">A legenda aparece aqui.</p>
          )}

          {form.hashtags.trim() && (
            <p className="text-[10.5px] leading-relaxed text-sky-600 dark:text-sky-400">
              {form.hashtags
                .split(/[,\s]+/)
                .filter(Boolean)
                .map((tag) => `#${tag.replace(/^#+/, "")}`)
                .join(" ")}
            </p>
          )}

          {form.cta.trim() && (
            <p className="text-[11px] font-semibold text-foreground">{form.cta}</p>
          )}

          {form.affiliate_disclosure.trim() && (
            <p className="text-[9.5px] leading-relaxed text-muted-foreground">
              {form.affiliate_disclosure}
            </p>
          )}
        </div>
      </div>

      {form.format === "carousel" && assets.length > 1 && (
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          {assets.length} slides no carrossel
        </p>
      )}
    </div>
  );
}