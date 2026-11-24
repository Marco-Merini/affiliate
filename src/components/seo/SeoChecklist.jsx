import { CheckCircle2, CircleAlert, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteBaseUrl } from "@/lib/seo";

const Status = ({ ok, label }) => (
  <Badge
    variant="outline"
    className={
      ok
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
    }
  >
    {label}
  </Badge>
);

export default function SeoChecklist({ settings }) {
  const base = siteBaseUrl(settings);
  const indexable = settings?.allow_indexing !== false;
  const verified = Boolean(settings?.search_console_verification);

  const rows = [
    { label: "URLs amigáveis", ok: true, text: "Ativo" },
    { label: "Metadados dinâmicos", ok: true, text: "Ativo" },
    { label: "Canonical e Open Graph", ok: true, text: "Ativo" },
    { label: "Dados estruturados JSON-LD", ok: true, text: "Ativo" },
    { label: "Sitemap XML", ok: true, text: "Automático" },
    { label: "Indexação", ok: indexable, text: indexable ? "Liberada" : "Bloqueada" },
    {
      label: "Google Search Console",
      ok: verified,
      text: verified ? "Verificação configurada" : "Pendente",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Checklist técnico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-3">
              <span className="text-sm text-foreground/80">{row.label}</span>
              <Status ok={row.ok} label={row.text} />
            </li>
          ))}
        </ul>

        <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Arquivos públicos
          </p>
          <a
            href={`${base}/sitemap.xml`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {base}/sitemap.xml
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          <a
            href={`${base}/robots.txt`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {base}/robots.txt
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {verified ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            ) : (
              <CircleAlert className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            )}
            Como verificar no Search Console
          </p>
          <ol className="list-decimal space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
            <li>
              Abra{" "}
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                search.google.com/search-console
              </a>{" "}
              e adicione a propriedade do tipo prefixo de URL.
            </li>
            <li>Escolha a verificação por tag HTML e copie o valor de content.</li>
            <li>Cole o valor no campo de verificação e salve.</li>
            <li>Volte ao Search Console e confirme a verificação.</li>
            <li>Envie o sitemap informado acima na seção Sitemaps.</li>
          </ol>
          <p className="text-xs text-muted-foreground">
            Os dados de impressões, cliques e posição média ficam disponíveis apenas no próprio
            Search Console. Não há conexão automática configurada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}