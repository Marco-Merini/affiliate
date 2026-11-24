import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Brand from "@/components/site/Brand";
import SearchBar from "@/components/site/SearchBar";
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
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-[60px] w-full max-w-[120rem] items-center gap-3 px-4 sm:h-[72px] sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <div className="mt-2">
              <Brand />
            </div>
            <div className="mt-5">
              <SearchBar placeholder="Buscar produtos" />
            </div>
            <nav aria-label="Navegação mobile" className="mt-4 flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex h-14 items-center border-b border-border text-[15px] font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" aria-label="Radar de Ofertas, página inicial" className="shrink-0">
          <Brand />
        </Link>

        <nav aria-label="Navegação principal" className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "border-b-2 px-3 py-1 text-[15px] font-medium transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/75 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden w-[320px] md:block xl:w-[420px]">
          <SearchBar placeholder="Buscar produtos" showButton={false} />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Link
            to="/produtos"
            aria-label="Pesquisar produtos"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full md:hidden")}
          >
            <Search className="h-4 w-4" />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}