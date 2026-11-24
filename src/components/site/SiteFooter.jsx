import { Link } from "@tanstack/react-router";
import Brand from "@/components/site/Brand";

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
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto grid w-full max-w-[120rem] gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Brand tone="dark" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Ofertas e produtos selecionados dos principais marketplaces.
          </p>
        </div>

        <nav aria-label="Explorar">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Explorar</p>
          <ul className="mt-4 space-y-2.5">
            {EXPLORE.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
            Institucional
          </p>
          <ul className="mt-4 space-y-2.5">
            {LEGAL.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-footer-border">
        <div className="mx-auto flex w-full max-w-[120rem] flex-col items-center justify-between gap-2 px-4 py-5 text-[13px] sm:flex-row sm:px-6">
          <p>Radar de Ofertas · Todos os direitos reservados</p>
          <Link to="/painel" className="transition-colors hover:text-white">
            Painel
          </Link>
        </div>
      </div>
    </footer>
  );
}