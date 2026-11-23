export const POST_FORMATS = [
  { value: "single_image", label: "Imagem única" },
  { value: "carousel", label: "Carrossel" },
];

export const POST_STATUS_CLASS = {
  draft: "border-border bg-muted text-muted-foreground",
  pending_approval: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  changes_requested: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  scheduled: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  publishing: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  published: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  failed: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  cancelled: "border-border bg-muted text-muted-foreground",
};

export const formatLabel = (value) =>
  POST_FORMATS.find((item) => item.value === value)?.label ?? value;

export const CAPTION_LIMIT = 2200;

export const parseHashtags = (text) =>
  Array.from(
    new Set(
      String(text ?? "")
        .split(/[,\s]+/)
        .map((item) => item.replace(/^#+/, "").trim())
        .filter(Boolean),
    ),
  ).slice(0, 30);

export const hashtagsToText = (list) => (list ?? []).map((tag) => `#${tag}`).join(" ");