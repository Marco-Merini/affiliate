import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, Star, Store } from "lucide-react";
import { Image } from "@/components/ui/image";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import ProductGrid from "@/components/site/ProductGrid";
import SectionHeading from "@/components/site/SectionHeading";
import { Button, buttonVariants } from "@/components/ui/button";
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
      title: product.name,
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
  const { product, links, related } = Route.useLoaderData();
  const price = Number(product.current_price) > 0 ? formatCurrency(product.current_price) : null;
  const previous =
    Number(product.previous_price) > 0 ? formatCurrency(product.previous_price) : null;
  const rating = Number(product.rating) > 0 ? Number(product.rating) : null;
  const ctaHref = affiliateHref(product, links);
  const external = Boolean(ctaHref && ctaHref.startsWith("http"));

  const info = [
    { label: "Tipo", value: product.type === "digital" ? "Produto digital" : "Produto físico" },
    { label: "Marketplace", value: product.marketplace || "Não informado" },
    { label: "Categoria", value: product.category?.name || "Sem categoria" },
    ...(product.price_checked_at
      ? [{ label: "Preço conferido em", value: formatDateTime(product.price_checked_at) }]
      : []),
    {
      label: "Última atualização",
      value: product.updated_date ? formatDateTime(product.updated_date) : "—",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[120rem] px-4 py-8 sm:px-6 sm:py-10">
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

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-xl border border-border bg-card p-6 sm:p-8">
            <Image
              src={product.image_url}
              alt={product.name}
              fittingType="fit"
              className="aspect-square w-full object-contain"
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="flex flex-wrap items-center gap-2">
            {product.category ? (
              <Link
                to="/categorias/$slug"
                params={{ slug: product.category.slug }}
                className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground"
              >
                {product.category.name}
              </Link>
            ) : null}
            {product.marketplace ? (
              <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                <Store className="h-3 w-3" aria-hidden="true" />
                {product.marketplace}
              </span>
            ) : null}
          </div>

          <h1 className="mt-3 font-heading text-2xl font-extrabold leading-tight tracking-[-0.02em] sm:text-[2rem]">
            {product.name}
          </h1>

          {rating ? (
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 fill-[#F5A524] text-[#F5A524]" aria-hidden="true" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              {Number(product.review_count) > 0 ? (
                <span className="text-muted-foreground">
                  · {formatNumber(product.review_count)} avaliações
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6">
            {previous ? (
              <span className="block text-sm text-muted-foreground line-through">{previous}</span>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "font-heading text-[2.5rem] font-extrabold leading-none tracking-[-0.02em]",
                  product.discount ? "text-destructive" : "text-foreground",
                )}
              >
                {price ?? "Ver preço"}
              </span>
              {product.discount ? (
                <span className="rounded-md bg-destructive/10 px-2 py-1 text-[13px] font-bold text-destructive">
                  -{product.discount}%
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            {ctaHref ? (
              <a
                href={ctaHref}
                rel="sponsored nofollow noopener"
                {...(external ? { target: "_blank" } : {})}
                className={cn(buttonVariants({ size: "lg" }), "h-14 w-full rounded-full text-[15px]")}
              >
                Comprar{product.marketplace ? ` em ${product.marketplace}` : ""}
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <div>
                <Button disabled className="h-14 w-full rounded-full text-[15px]">
                  Oferta indisponível
                </Button>
                <Link
                  to="/produtos"
                  className="mt-3 block text-center text-sm font-semibold text-primary hover:underline"
                >
                  Veja produtos semelhantes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {product.description ? (
        <section className="mt-12 max-w-[72ch]">
          <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">Descrição</h2>
          <div className="mt-3 whitespace-pre-line text-base leading-[1.7] text-foreground/85">
            {product.description}
          </div>
        </section>
      ) : null}

      <section className="mt-10 max-w-3xl">
        <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">Informações do produto</h2>
        <dl className="mt-3 overflow-hidden rounded-xl border border-border">
          {info.map((row, index) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between gap-4 px-4 py-3 text-sm",
                index % 2 === 0 ? "bg-muted/60" : "bg-card",
              )}
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {related.length ? (
        <section className="mt-14">
          <SectionHeading
            title="Produtos relacionados"
            action={
              product.category
                ? { label: "Ver categoria", to: `/categorias/${product.category.slug}` }
                : { label: "Ver todos", to: "/produtos" }
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