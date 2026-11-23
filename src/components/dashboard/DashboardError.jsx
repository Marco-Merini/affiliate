import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ onRetry }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
        <AlertCircle className="h-5 w-5" />
      </span>
      <p className="text-[14px] font-semibold">Não foi possível carregar o dashboard</p>
      <p className="mt-1 max-w-[42ch] text-[12.5px] leading-relaxed text-muted-foreground">
        Os indicadores vêm do banco de dados e a consulta falhou. Tente novamente em instantes.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RotateCw className="mr-2 h-3.5 w-3.5" />
        Tentar novamente
      </Button>
    </div>
  );
}