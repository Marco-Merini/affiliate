export const PRODUCT_TYPES = [
  { value: "physical", label: "Físico" },
  { value: "digital", label: "Digital" },
];

export const PRODUCT_STATUSES = [
  { value: "active", label: "Ativo" },
  { value: "paused", label: "Pausado" },
  { value: "archived", label: "Arquivado" },
];

export const PRODUCT_STATUS_CLASS = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  paused: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  archived: "border-border bg-muted text-muted-foreground",
};

export const PRODUCT_TYPE_CLASS = {
  physical: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  digital: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
};

export const PROGRAM_PLATFORMS = [
  { value: "mercado_livre", label: "Mercado Livre" },
  { value: "amazon", label: "Amazon" },
  { value: "shopee", label: "Shopee" },
  { value: "hotmart", label: "Hotmart" },
  { value: "outro", label: "Outro" },
];

export const PROGRAM_PLATFORM_CLASS = {
  mercado_livre: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500",
  amazon: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  shopee: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  hotmart: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  outro: "border-border bg-muted text-muted-foreground",
};

export const productTypeLabel = (value) =>
  PRODUCT_TYPES.find((item) => item.value === value)?.label ?? value;

export const productStatusLabel = (value) =>
  PRODUCT_STATUSES.find((item) => item.value === value)?.label ?? value;

export const programPlatformLabel = (value) =>
  PROGRAM_PLATFORMS.find((item) => item.value === value)?.label ?? value;

export const formatPercent = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(Number(value))}%`;
};

export const hasValue = (value) => value !== null && value !== undefined && value !== "";