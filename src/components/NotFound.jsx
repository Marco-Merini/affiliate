import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound({ children }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-heading text-5xl font-extrabold tracking-tight">404</p>
      <p className="text-muted-foreground">
        {children ?? "A página que você procura não existe ou foi movida."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          Voltar
        </Button>
        <Button asChild>
          <Link to="/produtos">Ver produtos</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/">Ir para o início</Link>
        </Button>
      </div>
    </div>
  );
}