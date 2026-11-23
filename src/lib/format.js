export const TZ = "America/Sao_Paulo";

export const formatNumber = (value) =>
  new Intl.NumberFormat("pt-BR").format(Number(value ?? 0));

export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value ?? 0),
  );

export const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: TZ });
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const dayKey = (value) => new Date(value).toLocaleDateString("sv-SE", { timeZone: TZ });

export const monthKey = (value = new Date()) =>
  new Date(value).toLocaleDateString("sv-SE", { timeZone: TZ }).slice(0, 7);

export const formatLongDate = (value = new Date()) =>
  new Date(value).toLocaleDateString("pt-BR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const relativeTime = (value) => {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d atrás`;
  return formatDate(value);
};

export const greeting = (value = new Date()) => {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", hour12: false }).format(value),
  );
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};