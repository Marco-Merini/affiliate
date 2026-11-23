export const POST_STATUSES = [
  { value: "draft", label: "Rascunho", tone: "muted", color: "hsl(var(--muted-foreground))" },
  { value: "pending_approval", label: "Aguardando aprovação", tone: "warning", color: "hsl(var(--chart-3))" },
  { value: "changes_requested", label: "Alterações solicitadas", tone: "warning", color: "hsl(var(--chart-4))" },
  { value: "rejected", label: "Reprovado", tone: "danger", color: "hsl(var(--chart-5))" },
  { value: "approved", label: "Aprovado", tone: "success", color: "hsl(var(--chart-2))" },
  { value: "scheduled", label: "Agendado", tone: "info", color: "hsl(var(--chart-1))" },
  { value: "publishing", label: "Publicando", tone: "info", color: "hsl(var(--chart-1))" },
  { value: "published", label: "Publicado", tone: "success", color: "hsl(var(--brand))" },
  { value: "failed", label: "Falhou", tone: "danger", color: "hsl(var(--destructive))" },
  { value: "cancelled", label: "Cancelado", tone: "muted", color: "hsl(var(--muted-foreground))" },
];

export const statusLabel = (value) =>
  POST_STATUSES.find((status) => status.value === value)?.label ?? value;

export const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "pinterest", label: "Pinterest" },
];

export const platformLabel = (value) =>
  PLATFORMS.find((platform) => platform.value === value)?.label ?? value;

export const BUSINESS_RULES = {
  language: "Português (Brasil)",
  currency: "BRL — Real brasileiro",
  timezone: "America/Sao_Paulo",
  dailyFrequency: "3 a 5 publicações por dia (somadas em todos os canais)",
  approval: "Revisão manual obrigatória antes de qualquer publicação",
};