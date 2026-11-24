import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { LayoutDashboard, Menu, Moon, Search, Sun } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Brand from "@/components/site/Brand";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Produtos", to: "/produtos" },
  { label: "Categorias", to: "/categorias" },
  { label: "Ofertas", to: "/ofertas" },
  { label: "Guias", to: "/blog" },
];

export default function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link to="/" aria-label="AffiliateFlow, página inicial" className="mr-2">
          <Brand />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/produtos"
            aria-label="Pesquisar produtos"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <Search className="h-4 w-4" />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link
            to="/painel"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:inline-flex")}
          >
            <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
            Painel
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="mt-2">
                <Brand subtitle="Recomendações independentes" />
              </div>
              <nav aria-label="Navegação mobile" className="mt-6 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/painel"
                  className="mt-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Painel administrativo
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}