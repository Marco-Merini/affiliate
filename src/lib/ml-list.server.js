// Leitor da página pública de lista de afiliados do Mercado Livre (meli.la).
// Extrai nome, link, imagem, vendedor, preços, nota e avaliações de cada card.

const ENTITIES = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&ordm;": "º",
  "&ordf;": "ª",
};

const text = (value) =>
  String(value ?? "")
    .replace(/&(nbsp|amp|quot|#39|lt|gt|ordm|ordf);/g, (match) => ENTITIES[match] ?? match)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Lê o primeiro valor monetário que aparece depois da classe informada
// (`poly-price__previous` ou `poly-price__amount`) e soma os centavos que
// venham imediatamente depois dele.
const amount = (chunk, className) => {
  const start = chunk.search(new RegExp(className));
  if (start < 0) return null;
  const block = chunk.slice(start, start + 900);
  const fraction = block.match(/andes-money-amount__fraction"[^>]*>([\d.]+)<\/span>/);
  if (!fraction) return null;
  const tail = block.slice(fraction.index + fraction[0].length, fraction.index + fraction[0].length + 300);
  const cents = tail.match(
    /^(?:<span[^>]*>[^<]{0,3}<\/span>)?<span class="andes-money-amount__cents[^"]*"[^>]*>(\d+)<\/span>/,
  );
  const value = Number(fraction[1].replace(/\./g, "")) + (cents ? Number(cents[1]) / 100 : 0);
  return Number.isFinite(value) && value > 0 ? value : null;
};

const attribute = (tag, name) => {
  const match = String(tag ?? "").match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : null;
};

const externalId = (url) => {
  const value = String(url ?? "");
  const wid = value.match(/[?&#]wid=(MLB\d+)/i) || value.match(/item_id(?:%3A|:)(MLB\d+)/i);
  if (wid) return wid[1].toUpperCase();
  const path = value.match(/\/(MLB-?\d+)/i);
  return path ? path[1].replace("-", "").toUpperCase() : null;
};

export function parseMlList(html) {
  const chunks = String(html ?? "").split('class="poly-card__portada"').slice(1);
  const items = [];

  for (const chunk of chunks) {
    const anchor = chunk.match(/<a\b[^>]*class="poly-component__title"[^>]*>[\s\S]*?<\/a>/);
    const url = attribute(anchor?.[0], "href");
    const name = text(anchor?.[0]?.replace(/^<a\b[^>]*>/, ""));
    if (!url || !name) continue;

    const imageTag = chunk.match(/<img\b[^>]*poly-component__picture[^>]*>/);
    const image = attribute(imageTag?.[0], "src");
    const sellerBlock = chunk.match(/poly-component__seller">([\s\S]*?)<\/span>/);
    const ratingLabel = chunk.match(/Avalia(?:ç|c)[aã]o\s*([\d,]+)\s*de\s*5/i);
    const reviewsLabel = chunk.match(/\(([\d.]+)\s*avalia/i);

    items.push({
      name,
      url: url.replace(/&amp;/g, "&"),
      image: image ? image.replace(/&amp;/g, "&") : null,
      seller: sellerBlock ? text(sellerBlock[1]).replace(/^Por\s*/i, "") : null,
      brand: text((chunk.match(/poly-component__brand">([^<]*)/) || [])[1]) || null,
      current_price: amount(chunk, "poly-price__amount"),
      previous_price: amount(chunk, "poly-price__previous"),
      rating: ratingLabel ? Number(ratingLabel[1].replace(",", ".")) : null,
      review_count: reviewsLabel ? Number(reviewsLabel[1].replace(/\./g, "")) : null,
      external_id: externalId(url),
    });
  }

  const unique = new Map();
  for (const item of items) {
    const key = item.external_id || item.name.toLowerCase();
    if (!unique.has(key)) unique.set(key, item);
  }
  return [...unique.values()];
}