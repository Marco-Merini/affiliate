import Breadcrumbs from "@/components/site/Breadcrumbs";

export default function LegalLayout({ title, intro, children }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: title }]} />
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {intro ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{intro}</p>
      ) : null}
      <div className="mt-8 space-y-7 text-sm leading-relaxed text-foreground/85">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="font-heading text-base font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}