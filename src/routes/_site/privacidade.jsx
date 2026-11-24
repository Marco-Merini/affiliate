import { createFileRoute } from "@tanstack/react-router";
import LegalLayout, { LegalSection } from "@/components/site/LegalLayout";
import { getPublicSettings } from "@/lib/storefront-fns";
import { buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/privacidade")({
  loader: () => getPublicSettings({ data: {} }),
  head: ({ loaderData }) =>
    buildHead({
      title: `Política de privacidade | ${siteName(loaderData)}`,
      description:
        "Como o AffiliateFlow trata dados de navegação, cliques em links de afiliados e preferências do visitante.",
      path: "/privacidade",
      settings: loaderData,
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const settings = Route.useLoaderData();

  return (
    <LegalLayout
      title="Política de privacidade"
      intro="Esta política explica quais informações o site trata ao navegar pelas nossas recomendações e como você pode exercer seus direitos."
    >
      <LegalSection title="Quem somos">
        <p>
          O AffiliateFlow é um site de recomendações de produtos. Não vendemos produtos, não
          processamos pagamentos e não realizamos entregas: indicamos onde comprar em marketplaces
          parceiros por meio de links de afiliados.
        </p>
      </LegalSection>

      <LegalSection title="Dados que tratamos">
        <p>
          Não exigimos cadastro para navegar. Não coletamos nome, CPF, endereço ou dados de cartão.
        </p>
        <p>
          Registramos de forma agregada os acessos às páginas e os cliques nos links de afiliados,
          incluindo a página de origem e o canal de entrada. Esses registros não identificam você
          pessoalmente e servem para entender quais recomendações são úteis.
        </p>
        <p>
          A sua preferência de tema (claro ou escuro) é guardada no armazenamento local do seu
          navegador.
        </p>
      </LegalSection>

      <LegalSection title="Links de afiliados">
        <p>
          Quando você clica em uma oferta, é direcionado ao site do marketplace parceiro. A partir
          desse momento, aplicam-se as políticas de privacidade e cookies daquele site, que não
          controlamos.
        </p>
      </LegalSection>

      <LegalSection title="Compartilhamento">
        <p>
          Não vendemos nem alugamos dados de visitantes. O marketplace parceiro recebe apenas o
          acesso ao link de afiliado, como qualquer visita ao site dele.
        </p>
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