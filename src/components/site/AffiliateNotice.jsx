import { Info } from "lucide-react";
import { DEFAULT_DISCLOSURE } from "@/lib/seo";
import { cn } from "@/lib/utils";

export default function AffiliateNotice({ text, className }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{text || DEFAULT_DISCLOSURE}</span>
    </p>
  );
}