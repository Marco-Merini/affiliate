export const OPPORTUNITY_SIGNALS = [
  {
    key: "signal_trend",
    label: "Tendência de vendas",
    weight: 20,
    hint: "As vendas estão crescendo nas últimas semanas?",
  },
  {
    key: "signal_volume",
    label: "Volume de vendas",
    weight: 15,
    hint: "Quanto o produto vende hoje, em volume real.",
  },
  {
    key: "signal_demand",
    label: "Procura e popularidade",
    weight: 15,
    hint: "Quantas pessoas procuram e pesquisam por ele.",
  },
  {
    key: "signal_commission",
    label: "Valor da comissão",
    weight: 15,
    hint: "Comissão em percentual e em reais por venda.",
  },
  {
    key: "signal_social",
    label: "Redes sociais e buscas",
    weight: 10,
    hint: "Crescimento de menções e pesquisas no Google.",
  },
  {
    key: "signal_reputation",
    label: "Reputação do produto e vendedor",
    weight: 10,
    hint: "Avaliações, devoluções e histórico do vendedor.",
  },
  {
    key: "signal_conversion",
    label: "Potencial de conversão",
    weight: 10,
    hint: "Facilidade de fechar a venda com esse público.",
  },
  {
    key: "signal_saturation",
    label: "Saturação da divulgação",
    weight: 5,
    invert: true,
    hint: "Quanto maior, mais afiliados divulgando o mesmo produto.",
  },
];

const clamp = (value) => Math.min(10, Math.max(0, value));

export const signalsProvided = (signals = {}) =>
  OPPORTUNITY_SIGNALS.filter((signal) => {
    const value = signals[signal.key];
    return value !== null && value !== undefined && value !== "" && !Number.isNaN(Number(value));
  }).length;

export const computeOpportunityScore = (signals = {}) => {
  let weighted = 0;
  let totalWeight = 0;

  OPPORTUNITY_SIGNALS.forEach((signal) => {
    const raw = signals[signal.key];
    if (raw === null || raw === undefined || raw === "" || Number.isNaN(Number(raw))) return;
    const value = clamp(Number(raw));
    weighted += (signal.invert ? 10 - value : value) * signal.weight;
    totalWeight += signal.weight;
  });

  if (!totalWeight) return null;
  return Math.round((weighted / totalWeight) * 10);
};

export const OPPORTUNITY_TIERS = [
  {
    min: 80,
    label: "Oportunidade alta",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    min: 60,
    label: "Boa oportunidade",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  {
    min: 40,
    label: "Oportunidade média",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    min: 0,
    label: "Oportunidade baixa",
    className: "border-border bg-muted text-muted-foreground",
  },
];

export const opportunityTier = (score) => {
  if (score === null || score === undefined) {
    return { label: "Não analisado", className: "border-border bg-muted text-muted-foreground" };
  }
  return OPPORTUNITY_TIERS.find((tier) => Number(score) >= tier.min) ?? OPPORTUNITY_TIERS[3];
};

export const opportunitySignalsFrom = (product) =>
  Object.fromEntries(
    OPPORTUNITY_SIGNALS.map((signal) => [
      signal.key,
      product?.[signal.key] === null || product?.[signal.key] === undefined
        ? null
        : Number(product[signal.key]),
    ]),
  );