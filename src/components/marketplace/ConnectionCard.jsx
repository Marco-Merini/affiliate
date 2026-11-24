import { AlertTriangle, CheckCircle2, Loader2, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConnectionCard({
  configured,
  connected,
  nickname,
  onConnect,
  onDisconnect,
  connecting,
  disconnecting,
}) {
  if (!configured) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Credenciais do Mercado Livre não configuradas
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-amber-900/80">
          Crie uma aplicação em developers.mercadolivre.com.br com a URL de retorno{" "}
          <span className="font-mono text-[11.5px]">
            https://large-smart-affiliate-flow.base44.app/api/mercadolivre/callback
          </span>{" "}
          e adicione o Client ID e o Client Secret na página Secrets do painel. A integração passa a
          funcionar assim que as credenciais existirem.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {connected ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />
        ) : (
          <Plug className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
        <div>
          <p className="text-[13px] font-semibold">
            {connected ? `Conectado${nickname ? ` como ${nickname}` : ""}` : "Conta não conectada"}
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {connected
              ? "A busca usa a API oficial do Mercado Livre com a sua autorização."
              : "Autorize sua conta para buscar produtos reais do Mercado Livre."}
          </p>
        </div>
      </div>

      {connected ? (
        <Button variant="outline" size="sm" onClick={onDisconnect} disabled={disconnecting}>
          {disconnecting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          Desconectar
        </Button>
      ) : (
        <Button size="sm" onClick={onConnect} disabled={connecting}>
          {connecting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          Conectar Mercado Livre
        </Button>
      )}
    </div>
  );
}