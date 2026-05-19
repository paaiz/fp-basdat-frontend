export function formatCurrency(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function toShortName(name) {
  const text = String(name || "").trim();
  if (!text) return "M";
  const parts = text.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function safeText(value, fallback = "-") {
  const text = String(value ?? "").trim();
  return text || fallback;
}
