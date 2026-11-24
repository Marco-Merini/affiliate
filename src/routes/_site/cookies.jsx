import { createFileRoute } from "@tanstack/react-router";
import LegalLayout, { LegalSection } from "@/components/site/LegalLayout";
import { getPublicSettings } from "@/lib/storefront-fns";
import { buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/cookies")({
  loader: () => getPublicSettings({ data: {} }),
  head: ({ loaderData }) =>
    buildHead({
      title: `Política de cookies | ${siteName(loaderData)}`,
      description: "Quais cookies e armazenamento local o site utiliza e como gerenciar suas preferências.",
      path: "/cookies",
      settings: loaderData,
    }),
  component: CookiesPage,
});

function CookiesPage() {
  const settings = Route.useLoaderData();

  return (
    <LegalLayout
      title="Política de cookies"
      intro="Usamos o mínimo necessário para o site funcionar bem. Não utilizamos cookies de publicidade comportamental."
    >
      <LegalSection title="O que são cookies e armazenamento local">
        <p>
          Cookies e armazenamento local são pequenos registros guardados pelo navegador. Eles
          permitem lembrar preferências e medir o uso do site.
        </p>
      </LegalSection>

      <LegalSection title="O que utilizamos">
        <p>
          Preferência de tema: guardamos no armazenamento local se você escolheu o modo claro ou
          escuro, para manter a escolha na próxima visita.
        </p>
        <p>
          Medição interna: registramos acessos a páginas e cliques nas ofertas de forma agregada,
          sem identificar você pessoalmente.
        </p>
        <p>
          Não usamos cookies de redes de anúncios nem criamos perfis de navegação para publicidade.
        </p>
      </LegalSection>

      <LegalSection title="Cookies de terceiros">
        <p>
          Ao clicar em uma oferta, você visita o site da loja parceira. Aquele site pode definir
          cookies próprios, conforme as políticas dele. Não temos controle sobre esses cookies.
        </p>
      </LegalSection>

      <LegalSection title="Como gerenciar">
        <p>
          Você pode apagar cookies e dados de sites pelas configurações do seu navegador. Bloquear
          o armazenamento local não impede a navegação, mas a preferência de tema deixa de ser
          lembrada.
        </p>
      </LegalSection>

      <LegalSection title="Contato">
        <p>
          {settings?.contact_email ? (
            <>
              Dúvidas sobre cookies podem ser enviadas para{" "}
              <a
                href={`mailto:${settings.contact_email}`}
                className="font-medium text-primary hover:underline"
              >
                {settings.contact_email}
              </a>
              .
            </>
          ) : (
            "Dúvidas sobre cookies podem ser enviadas pelo canal de contato informado no site."
          )}
        </p>
      </LegalSection>
    </LegalLayout>
  );
}