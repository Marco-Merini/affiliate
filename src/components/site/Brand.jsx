import { Radar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Brand({ subtitle = null, tone = "default", className }) {
  const onDark = tone === "dark";

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Radar className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block font-heading text-[17px] font-extrabold tracking-[-0.02em]",
            onDark ? "text-white" : "text-foreground",
          )}
        >
          Radar de Ofertas
        </span>
        {subtitle ? (
          <span className={cn("block text-[11px]", onDark ? "text-white/60" : "text-muted-foreground")}>
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}