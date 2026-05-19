const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api";

export async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(json?.error || json?.message || `Request gagal (${res.status})`);
  }

  return json;
}

export function asList(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

export function asItem(payload) {
  if (Array.isArray(payload?.data)) return payload.data[0] ?? null;
  if (Array.isArray(payload)) return payload[0] ?? null;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (payload && !Array.isArray(payload)) return payload;
  return null;
}
