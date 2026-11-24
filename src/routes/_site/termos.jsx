import { createFileRoute } from "@tanstack/react-router";
import LegalLayout, { LegalSection } from "@/components/site/LegalLayout";
import { getPublicSettings } from "@/lib/storefront-fns";
import { buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/termos")({
  loader: () => getPublicSettings({ data: {} }),
  head: ({ loaderData }) =>
    buildHead({
      title: `Termos de uso | ${siteName(loaderData)}`,
      description:
        "Condições de uso do AffiliateFlow, site de recomendações com links de afiliados para marketplaces parceiros.",
      path: "/termos",
      settings: loaderData,
    }),
  component: TermsPage,
});

function TermsPage() {
  const settings = Route.useLoaderData();

  return (
    <LegalLayout
      title="Termos de uso"
      intro="Ao navegar neste site, você concorda com as condições abaixo. Elas descrevem o que o AffiliateFlow faz e o que não faz."
    >
      <LegalSection title="Objeto do site">
        <p>
          O AffiliateFlow publica recomendações, comparativos e ofertas de produtos de terceiros.
          O conteúdo é informativo e não constitui promessa de resultado, economia garantida ou
          disponibilidade de estoque.
        </p>
      </LegalSection>

      <LegalSection title="Relação comercial">
        <p>
          Os links de oferta são links de afiliados. Podemos receber comissão quando você compra por
          meio deles, sem custo adicional para você. Essa relação não altera o preço exibido no
          marketplace.
        </p>
      </LegalSection>

      <LegalSection title="Compra e pós-venda">
        <p>
          A compra é concluída no site do marketplace parceiro. Pagamento, nota fiscal, entrega,
          troca e garantia são responsabilidade do vendedor e da plataforma onde a compra foi feita.
        </p>
        <p>
          Preços, prazos e condições podem mudar a qualquer momento no marketplace. Sempre confirme
          o valor final antes de finalizar a compra.
        </p>
      </LegalSection>

      <LegalSection title="Uso permitido">
        <p>
          É permitido navegar, compartilhar links das nossas páginas e citar o conteúdo com
          atribuição. Não é permitido copiar o conteúdo integralmente, automatizar acessos de forma
          abusiva ou usar o site para atividades ilícitas.
        </p>
      </LegalSection>

      <LegalSection title="Limitação de responsabilidade">
        <p>
          Fazemos o possível para manter preços e informações atualizados, mas não garantimos
          exatidão permanente. Não respondemos por indisponibilidade de produtos, variações de preço
          ou práticas dos marketplaces parceiros.
        </p>
      </LegalSection>

      <LegalSection title="Legislação">
        <p>
          Estes termos seguem a legislação brasileira.
          {settings?.contact_email ? (
            <>
              {" "}
              Dúvidas podem ser enviadas para{" "}
              <a
                href={`mailto:${settings.contact_email}`}
                className="font-medium text-primary hover:underline"
              >
                {settings.contact_email}
              </a>
              .
            </>
          ) : (
            " Dúvidas podem ser enviadas pelo canal de contato informado no site."
          )}
        </p>
      </LegalSection>
    </LegalLayout>
  );
}