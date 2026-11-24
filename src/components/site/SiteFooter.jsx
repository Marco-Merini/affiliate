import { Link } from "@tanstack/react-router";
import Brand from "@/components/site/Brand";
import { DEFAULT_DISCLOSURE } from "@/lib/seo";

const EXPLORE = [
  { label: "Todos os produtos", to: "/produtos" },
  { label: "Categorias", to: "/categorias" },
  { label: "Ofertas", to: "/ofertas" },
  { label: "Guias e comparações", to: "/blog" },
];

const LEGAL = [
  { label: "Política de privacidade", to: "/privacidade" },
  { label: "Termos de uso", to: "/termos" },
  { label: "Política de cookies", to: "/cookies" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Brand subtitle="Recomendações independentes" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Selecionamos produtos de terceiros, comparamos o que realmente importa e indicamos
            onde comprar. Você compra direto no marketplace parceiro, com a mesma garantia da loja.
          </p>
          <p className="mt-4 max-w-sm rounded-lg border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
            {DEFAULT_DISCLOSURE}
          </p>
        </div>

        <nav aria-label="Explorar">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Explorar
          </p>
          <ul className="mt-3 space-y-2">
            {EXPLORE.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Institucional
          </p>
          <ul className="mt-3 space-y-2">
            {LEGAL.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border py-5">
        <p className="mx-auto w-full max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          AffiliateFlow · Conteúdo de recomendações com links de afiliados. Preços e
          disponibilidade são definidos pelos marketplaces parceiros.
        </p>
      </div>
    </footer>
  );
}