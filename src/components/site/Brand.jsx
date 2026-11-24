export default function Brand({ subtitle = null }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M5 17.5 12 6.5l7 11"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand ring-2 ring-background" />
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-[15px] font-extrabold tracking-tight">
          AffiliateFlow
        </span>
        {subtitle ? (
          <span className="block text-[11px] text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
    </span>
  );
}