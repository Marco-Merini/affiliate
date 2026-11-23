import { formatDate } from "@/lib/format";

export const CAMPAIGN_OBJECTIVES = [
  { value: "sales", label: "Vendas" },
  { value: "awareness", label: "Reconhecimento" },
  { value: "engagement", label: "Engajamento" },
  { value: "leads", label: "Leads" },
];

export const CAMPAIGN_STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "active", label: "Ativa" },
  { value: "paused", label: "Pausada" },
  { value: "finished", label: "Finalizada" },
  { value: "cancelled", label: "Cancelada" },
];

export const CAMPAIGN_STATUS_CLASS = {
  draft: "border-border bg-muted text-muted-foreground",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  paused: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  finished: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
};

export const objectiveLabel = (value) =>
  CAMPAIGN_OBJECTIVES.find((item) => item.value === value)?.label ?? value;

export const campaignStatusLabel = (value) =>
  CAMPAIGN_STATUSES.find((item) => item.value === value)?.label ?? value;

export const formatCampaignPeriod = (startDate, endDate) => {
  if (!startDate && !endDate) return "Sem período definido";
  if (startDate && endDate) return `${formatDate(startDate)} a ${formatDate(endDate)}`;
  if (startDate) return `A partir de ${formatDate(startDate)}`;
  return `Até ${formatDate(endDate)}`;
};

export const dateInputValue = (value) => (value ? String(value).slice(0, 10) : "");

export const dateInputToIso = (value) => (value ? `${value}T12:00:00.000Z` : null);