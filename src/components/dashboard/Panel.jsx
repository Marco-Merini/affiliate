import { cn } from "@/lib/utils";

export default function Panel({ title, description, action, className, children }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      <header className="flex items-start justify-between gap-3 px-5 pb-1 pt-5">
        <div>
          <h3 className="font-heading text-[13.5px] font-bold tracking-tight">{title}</h3>
          {description ? <p className="mt-0.5 text-[11.5px] text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="px-5 pb-5 pt-3">{children}</div>
    </section>
  );
}