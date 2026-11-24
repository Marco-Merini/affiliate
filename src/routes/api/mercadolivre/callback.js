import { createFileRoute } from "@tanstack/react-router";
import { DEFAULT_BASE_URL } from "@/lib/seo";
import {
  ML_CALLBACK_PATH,
  exchangeCode,
  isValidState,
  mlCredentials,
  saveConnection,
} from "@/lib/mercadolivre.server";

export const Route = createFileRoute("/api/mercadolivre/callback")({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const url = new URL(request.url);
        const back = (status) => Response.redirect(new URL(`/importar?ml=${status}`, url.origin), 302);

        const credentials = mlCredentials();
        if (!credentials) return back("sem-credenciais");

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (!code || !isValidState(state, credentials.clientSecret)) return back("invalido");

        try {
          const token = await exchangeCode(
            credentials,
            code,
            `${DEFAULT_BASE_URL}${ML_CALLBACK_PATH}`,
          );
          await saveConnection(context.getBase44().asServiceRole, token);
          return back("conectado");
        } catch {
          return back("erro");
        }
      },
    },
  },
});