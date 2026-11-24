import { createFileRoute } from "@tanstack/react-router";
import LegalLayout, { LegalSection } from "@/components/site/LegalLayout";
import { getPublicSettings } from "@/lib/storefront-fns";
import { buildHead, siteName } from "@/lib/seo";

export const Route = createFileRoute("/_site/termos")({
  loader: () => getPublicSettings({ data: {} }),
  head: ({ loaderData }) =>
    buildHead({
      title: `Termos de uso | ${siteName(loaderData)}`,
      description: "Condições de uso do site, das ofertas e das informações publicadas.",
      path: "/termos",
      settings: loaderData,
    }),
  component: TermsPage,
});

function TermsPage() {
  const settings = Route.useLoaderData();
  const name = siteName(settings);

  return (
    <LegalLayout
      title="Termos de uso"
      intro="Ao navegar neste site, você concorda com as condições abaixo."
    >
      <LegalSection title="Objeto do site">
        <p>
          {name} publica ofertas, comparações e informações sobre produtos de terceiros. O conteúdo
          é informativo e não constitui promessa de resultado, economia garantida ou
          disponibilidade de estoque.
        </p>
      </LegalSection>

      <LegalSection title="Ofertas e lojas parceiras">
        <p>
          As ofertas direcionam você para a loja parceira, onde a compra é concluída. Preços,
          condições e disponibilidade são definidos pela própria loja.
        </p>
      </LegalSection>

      <LegalSection title="Compra e pós-venda">
        <p>
          A compra é concluída no site da loja parceira. Pagamento, nota fiscal, entrega, troca e
          garantia são responsabilidade do vendedor e da plataforma onde a compra foi feita.
        </p>
        <p>
          Preços, prazos e condições podem mudar a qualquer momento. Sempre confirme o valor final
          antes de finalizar a compra.
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
          ou práticas das lojas parceiras.
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