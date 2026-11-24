export const KEYWORD_INTENTS = [
  { value: "informational", label: "Informacional" },
  { value: "commercial", label: "Comercial" },
  { value: "transactional", label: "Transacional" },
  { value: "navigational", label: "Navegacional" },
];

export const KEYWORD_PRIORITIES = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];

export const KEYWORD_STATUSES = [
  { value: "planned", label: "Planejada" },
  { value: "in_progress", label: "Em produção" },
  { value: "published", label: "Publicada" },
];

export const labelOf = (list, value) => list.find((item) => item.value === value)?.label ?? value;