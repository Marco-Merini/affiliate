import { createFileRoute } from "@tanstack/react-router";
import LegalLayout, { LegalSection } from "@/components/site/LegalLayout";
import { getPublicSettings } from "@/lib/storefront-fns";
import { buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/privacidade")({
  loader: () => getPublicSettings({ data: {} }),
  head: ({ loaderData }) =>
    buildHead({
      title: `Política de privacidade | ${siteName(loaderData)}`,
      description: "Como tratamos dados de navegação e preferências do visitante.",
      path: "/privacidade",
      settings: loaderData,
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const settings = Route.useLoaderData();
  const name = siteName(settings);

  return (
    <LegalLayout
      title="Política de privacidade"
      intro="Esta política explica quais informações o site trata ao navegar pelas nossas ofertas e como você pode exercer seus direitos."
    >
      <LegalSection title="Quem somos">
        <p>
          {name} é um site de ofertas e recomendações de produtos. Não vendemos produtos, não
          processamos pagamentos e não realizamos entregas: indicamos onde comprar nas lojas
          parceiras.
        </p>
      </LegalSection>

      <LegalSection title="Dados que tratamos">
        <p>
          Não exigimos cadastro para navegar. Não coletamos nome, CPF, endereço ou dados de cartão.
        </p>
        <p>
          Registramos de forma agregada os acessos às páginas e os cliques nas ofertas, incluindo a
          página de origem e o canal de entrada. Esses registros não identificam você pessoalmente e
          servem para entender quais ofertas são úteis.
        </p>
        <p>
          A sua preferência de tema (claro ou escuro) é guardada no armazenamento local do seu
          navegador.
        </p>
      </LegalSection>

      <LegalSection title="Lojas parceiras">
        <p>
          Quando você clica em uma oferta, é direcionado ao site da loja parceira. A partir desse
          momento, aplicam-se as políticas de privacidade e cookies daquele site, que não
          controlamos.
        </p>
      </LegalSection>

      <LegalSection title="Compartilhamento">
        <p>Não vendemos nem alugamos dados de visitantes.</p>
      </LegalSection>

      <LegalSection title="Seus direitos">
        <p>
          Você pode solicitar informações sobre o tratamento de dados ou pedir a exclusão de
          registros de navegação, conforme a Lei Geral de Proteção de Dados (LGPD).
          {settings?.contact_email ? (
            <>
              {" "}
              Fale com a gente pelo e-mail{" "}
              <a
                href={`mailto:${settings.contact_email}`}
                className="font-medium text-primary hover:underline"
              >
                {settings.contact_email}
              </a>
              .
            </>
          ) : (
            " Use o canal de contato informado no site."
          )}
        </p>
      </LegalSection>

      <LegalSection title="Alterações">
        <p>
          Podemos atualizar esta política para refletir mudanças no site. A versão vigente é sempre
          a publicada nesta página.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}