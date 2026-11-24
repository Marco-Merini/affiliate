export const DEFAULT_BASE_URL = "https://large-smart-affiliate-flow.base44.app";

export const DEFAULT_DISCLOSURE =
  "Esta página contém links de afiliados. Podemos receber uma comissão caso você realize uma compra por meio desses links, sem custo adicional para você.";

export const slugify = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const siteBaseUrl = (settings) =>
  String(settings?.base_url || DEFAULT_BASE_URL).replace(/\/+$/, "");

export const absoluteUrl = (settings, path = "/") =>
  `${siteBaseUrl(settings)}${path.startsWith("/") ? path : `/${path}`}`;

export const siteName = (settings) => settings?.site_name || "AffiliateFlow";

export const discountPercent = (current, previous) => {
  const price = Number(current);
  const before = Number(previous);
  if (!price || !before || before <= price) return null;
  return Math.round(((before - price) / before) * 100);
};

export const affiliateHref = (product, links = []) => {
  const primary = links.find((link) => link.is_primary) ?? links[0];
  if (primary?.id) return `/api/r/${primary.id}?p=direto`;
  return product?.affiliate_url || null;
};

export const buildHead = ({
  title,
  description,
  path = "/",
  settings,
  image,
  type = "website",
  noindex = false,
  jsonLd = [],
}) => {
  const name = siteName(settings);
  const url = absoluteUrl(settings, path);
  const desc = description || settings?.default_description || settings?.tagline || "";
  const indexable = settings?.allow_indexing !== false && !noindex;
  const meta = [
    { title },
    ...(desc ? [{ name: "description", content: desc }] : []),
    { name: "robots", content: indexable ? "index, follow" : "noindex, nofollow" },
    ...(settings?.search_console_verification
      ? [{ name: "google-site-verification", content: settings.search_console_verification }]
      : []),
    { property: "og:title", content: title },
    ...(desc ? [{ property: "og:description", content: desc }] : []),
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:site_name", content: name },
    { property: "og:locale", content: "pt_BR" },
    ...(image ? [{ property: "og:image", content: image }] : []),
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    ...(desc ? [{ name: "twitter:description", content: desc }] : []),
    ...(image ? [{ name: "twitter:image", content: image }] : []),
  ];

  const links = [{ rel: "canonical", href: url }];

  const scripts = (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    .filter(Boolean)
    .map((data) => ({ type: "application/ld+json", children: JSON.stringify(data) }));

  return { meta, links, scripts };
};

export const organizationJsonLd = (settings) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName(settings),
  url: siteBaseUrl(settings),
  ...(settings?.logo_url ? { logo: settings.logo_url } : {}),
});

export const websiteJsonLd = (settings) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName(settings),
  url: siteBaseUrl(settings),
});

export const breadcrumbJsonLd = (settings, items = []) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    ...(item.path ? { item: absoluteUrl(settings, item.path) } : {}),
  })),
});

export const productJsonLd = (settings, product, url) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description || undefined,
  image: product.image_url ? [product.image_url] : undefined,
  category: product.category?.name || undefined,
  url,
  ...(Number.isFinite(Number(product.rating)) && Number(product.rating) > 0
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number(product.rating),
          reviewCount: Number(product.review_count) || 1,
        },
      }
    : {}),
  ...(Number(product.current_price) > 0
    ? {
        offers: {
          "@type": "Offer",
          price: Number(product.current_price).toFixed(2),
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
          url,
        },
      }
    : {}),
});

export const articleJsonLd = (settings, article, url) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.excerpt || undefined,
  image: article.cover_image_url ? [article.cover_image_url] : undefined,
  datePublished: article.published_at || undefined,
  author: { "@type": "Organization", name: article.author_name || siteName(settings) },
  publisher: { "@type": "Organization", name: siteName(settings) },
  mainEntityOfPage: url,
});