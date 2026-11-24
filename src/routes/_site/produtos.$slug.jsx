import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck, Star, Store } from "lucide-react";
import { Image } from "@/components/ui/image";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import AffiliateNotice from "@/components/site/AffiliateNotice";
import ProductGrid from "@/components/site/ProductGrid";
import SectionHeading from "@/components/site/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { getStorefrontProduct } from "@/lib/storefront-fns";
import {
  affiliateHref,
  breadcrumbJsonLd,
  buildHead,
  productJsonLd,
  siteBaseUrl,
} from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/produtos/$slug")({
  loader: async ({ params }) => {
    const data = await getStorefrontProduct({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Produto não encontrado" }] };
    const { product, settings } = loaderData;
    const description = String(product.description || "").slice(0, 155);
    const path = `/produtos/${product.slug}`;
    return buildHead({
      title: `${product.name}${product.marketplace ? ` · ${product.marketplace}` : ""}`,
      description,
      path,
      settings,
      image: product.image_url,
      type: "product",
      jsonLd: [
        productJsonLd(settings, product, `${siteBaseUrl(settings)}${path}`),
        breadcrumbJsonLd(settings, [
          { label: "Início", path: "/" },
          { label: "Produtos", path: "/produtos" },
          { label: product.name, path },
        ]),
      ],
    });
  },
  component: ProductPage,
});

function ProductPage() {
  const { product, links, related, settings } = Route.useLoaderData();
  const price = Number(product.current_price) > 0 ? formatCurrency(product.current_price) : null;
  const previous =
    Number(product.previous_price) > 0 ? formatCurrency(product.previous_price) : null;
  const rating = Number(product.rating) > 0 ? Number(product.rating) : null;
  const ctaHref = affiliateHref(product, links);
  const external = Boolean(ctaHref && ctaHref.startsWith("http"));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[
          { label: "Início", to: "/" },
          { label: "Produtos", to: "/produtos" },
          ...(product.category
            ? [{ label: product.category.name, to: `/categorias/${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={product.image_url}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div>
          {product.category ? (
            <Link
              to="/categorias/$slug"
              params={{ slug: product.category.slug }}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:text-primary"
            >
              {product.category.name}
            </Link>
          ) : null}

          <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            {product.name}
          </h1>

          {rating ? (
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              {Number(product.review_count) > 0 ? (
                <span className="text-muted-foreground">
                  · {formatNumber(product.review_count)} avaliações
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline gap-2">
              {price ? (
                <span className="font-heading text-3xl font-extrabold tracking-tight">{price}</span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  Preço disponível no marketplace
                </span>
              )}
              {previous ? (
                <span className="text-sm text-muted-foreground line-through">{previous}</span>
              ) : null}
              {product.discount ? (
                <span className="rounded-full bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white">
                  -{product.discount}%
                </span>
              ) : null}
            </div>

            {product.marketplace ? (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Store className="h-4 w-4" aria-hidden="true" />
                Vendido por {product.marketplace}
              </p>
            ) : null}

            {product.price_checked_at ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Preço conferido em {formatDateTime(product.price_checked_at)}
              </p>
            ) : null}

            <div className="mt-5">
              {ctaHref ? (
                <a
                  href={ctaHref}
                  rel="sponsored nofollow noopener"
                  {...(external ? { target: "_blank" } : {})}
                  className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                >
                  Ver oferta{product.marketplace ? ` no ${product.marketplace}` : ""}
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Oferta temporariamente indisponível. Assim que o link for atualizado, ele volta a
                  aparecer aqui.
                </p>
              )}
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Preços e condições podem mudar no marketplace. Confirme o valor final antes de
              finalizar a compra.
            </p>
          </div>

          <div className="mt-4">
            <AffiliateNotice text={settings?.affiliate_disclosure} />
          </div>
        </div>
      </div>

      {product.description ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="font-heading text-lg font-bold tracking-tight">Sobre este produto</h2>
          <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
            {product.description}
          </div>
        </section>
      ) : null}

      <section className="mt-10 max-w-3xl">
        <h2 className="font-heading text-lg font-bold tracking-tight">Informações</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Tipo", value: product.type === "digital" ? "Produto digital" : "Produto físico" },
            { label: "Marketplace", value: product.marketplace || "Não informado" },
            { label: "Categoria", value: product.category?.name || "Sem categoria" },
            {
              label: "Última atualização",
              value: product.updated_date ? formatDateTime(product.updated_date) : "—",
            },
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-border bg-card px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {related.length ? (
        <section className="mt-14">
          <SectionHeading
            title="Produtos relacionados"
            description="Outras opções da mesma categoria."
            action={
              product.category
                ? { label: "Ver categoria", to: `/categorias/${product.category.slug}` }
                : undefined
            }
          />
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </div>
  );
}