import Breadcrumbs from "@/components/site/Breadcrumbs";

export default function LegalLayout({ title, intro, children }) {
  return (
    <div className="mx-auto w-full max-w-[120rem] px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: title }]} />
      <h1 className="mt-4 font-heading text-[1.75rem] font-extrabold tracking-[-0.02em] sm:text-[2.25rem]">
        {title}
      </h1>
      <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-10">
        {intro ? (
          <p className="max-w-[72ch] text-[15px] leading-relaxed text-muted-foreground">{intro}</p>
        ) : null}
        <div className="mt-6 max-w-[72ch] space-y-7 text-[15px] leading-[1.7] text-foreground/85">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="font-heading text-lg font-bold tracking-[-0.01em] text-foreground">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}