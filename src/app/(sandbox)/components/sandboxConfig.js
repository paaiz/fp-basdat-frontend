export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api";

export const SANDBOX_ROUTES = [
  { id: "home", label: "Beranda", href: "/sandbox" },
  { id: "mahasiswa", label: "Mahasiswa", href: "/sandbox/mahasiswa" },
  { id: "dosen", label: "Dosen", href: "/sandbox/dosen" },
  { id: "kelas", label: "Kelas", href: "/sandbox/kelas" },
  { id: "presensi", label: "Presensi", href: "/sandbox/presensi" },
  { id: "tendik", label: "Tendik", href: "/sandbox/tendik" },
  { id: "ukt", label: "UKT Tagihan", href: "/sandbox/ukt" },
];

export const ALLOWED_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
export const UKT_STATUSES = ["belum_dibayar", "lunas", "sebagian"];

export function initialMahasiswa() {
  return { nama: "", nrp: "", jenis_kelamin: "L", tahun_masuk: "", status: "aktif" };
}

export function initialDosen() {
  return { nama: "", nip: "", jenis_kelamin: "L" };
}

export function createScheduleRow() {
  return { hari: "Senin", jam_mulai: "", jam_selesai: "", ruangan: "" };
}

export function initialKelas() {
  return {
    kode_kelas: "",
    nama_kelas: "",
    id_dosen: "",
    schedule: [createScheduleRow()],
  };
}

export function initialKelasEnroll() {
  return {
    id_mahasiswa: "",
    id_kelas: "",
    semester: "",
  };
}

export function initialPresensi() {
  return {
    id_kelas: "",
    waktu_dibuka: "",
    waktu_ditutup: "",
  };
}

export function initialTendik() {
  return { nama: "", jabatan: "" };
}

export function initialUkt() {
  return {
    id_mahasiswa: "",
    semester: "",
    tahun_ajaran: "",
    nominal_tagihan: "",
    status_pembayaran: "belum_dibayar",
  };
}

export function sanitizeText(value) {
  return String(value ?? "").trim();
}

export function parseInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

export function toIsoDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

async function requestJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(json?.error || json?.message || `Request gagal (${res.status})`);
  }

  return json;
}

export async function postJson(path, body) {
  return requestJson(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function putJson(path, body) {
  return requestJson(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteJson(path) {
  return requestJson(path, {
    method: "DELETE",
  });
}

export async function getJson(path) {
  return requestJson(path);
}
