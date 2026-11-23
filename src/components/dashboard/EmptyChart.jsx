import { Inbox } from "lucide-react";

export default function EmptyChart({ title, description }) {
  return (
    <div className="flex h-[236px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 text-center">
      <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm">
        <Inbox className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <p className="text-[13px] font-semibold">{title}</p>
      <p className="mt-1 max-w-[34ch] text-[11.5px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}