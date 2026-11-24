import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import SeoSettingsForm from "@/components/seo/SeoSettingsForm";
import SeoChecklist from "@/components/seo/SeoChecklist";
import KeywordsPanel from "@/components/seo/KeywordsPanel";

export default function SeoView({ workspace }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold tracking-tight">SEO e Google</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Configure a identidade do site, os metadados padrão e a verificação do Search Console.
            As páginas públicas já saem com URLs amigáveis, canonical, Open Graph e dados
            estruturados.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Abrir vitrine
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <SeoSettingsForm settings={workspace.settings} />
        <div className="xl:sticky xl:top-20 xl:self-start">
          <SeoChecklist settings={workspace.settings} />
        </div>
      </div>

      <KeywordsPanel keywords={workspace.keywords} categories={workspace.categories} />
    </div>
  );
}