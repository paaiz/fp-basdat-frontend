import { safeText } from "@/app/(dashboard)/components/dashboardFormat";

const DAY_CANONICAL = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  // sabtu: "Sabtu",
  // minggu: "Minggu",
};

export function parseJsonArrayText(value) {
  if (Array.isArray(value)) return value;

  const raw = String(value ?? "").trim();
  if (!raw) return [];

  if (!(raw.startsWith("[") && raw.endsWith("]"))) {
    return [raw];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return [raw];
  }
}

export function normalizeDayLabel(value) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  return DAY_CANONICAL[key] || safeText(value, "Senin");
}

export function extractDayTokens(value) {
  const normalizedArray = parseJsonArrayText(value);
  if (normalizedArray.length > 1) {
    return normalizedArray.map((item) => normalizeDayLabel(item));
  }

  const raw = String(normalizedArray[0] ?? value ?? "").trim();
  if (!raw) return [];

  return raw
    .split(/[,&/]|\band\b|\bdan\b/gi)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => normalizeDayLabel(token));
}

export function normalizeTimeText(start, end, fallback) {
  const s = String(start ?? "").trim();
  const e = String(end ?? "").trim();

  if (s || e) {
    return [s, e].filter(Boolean).join(" - ");
  }

  return safeText(fallback, "");
}

export function normalizeRoomText(primary, fallback) {
  return safeText(primary || fallback, "Ruangan belum diatur");
}

export const WEEK_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
