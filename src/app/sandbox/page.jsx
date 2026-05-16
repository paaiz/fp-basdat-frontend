"use client";

import { useState, useEffect } from "react";
import Toast from "@/components/ui/Toast";

const API_BASE = "https://fp-basdat-backend.vercel.app/api";

function initialMahasiswa() {
  return { nama: "", nrp: "", jenis_kelamin: "L", tahun_masuk: "", status: "aktif" };
}
function initialDosen() {
  return { nama: "", nip: "", jenis_kelamin: "L" };
}

export default function SandboxPage() {
  const [tab, setTab] = useState("mahasiswa");
  const [mahasiswa, setMahasiswa] = useState(initialMahasiswa());
  const [dosen, setDosen] = useState(initialDosen());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (variant, title, message) => setToast({ variant, title, message });

  const validateMahasiswa = (data) => {
    if (!data.nama.trim()) return "Nama wajib diisi";
    if (!data.nrp.trim()) return "NRP wajib diisi";
    if (!["L", "P"].includes(data.jenis_kelamin)) return "Jenis kelamin tidak valid";
    const year = Number(data.tahun_masuk);
    if (!Number.isInteger(year) || year < 1900) return "Tahun masuk tidak valid";
    if (!["aktif", "lulus", "dropout"].includes(data.status)) return "Status tidak valid";
    return null;
  };

  const validateDosen = (data) => {
    if (!data.nama.trim()) return "Nama wajib diisi";
    if (!data.nip.trim()) return "NIP wajib diisi";
    if (!["L", "P"].includes(data.jenis_kelamin)) return "Jenis kelamin tidak valid";
    return null;
  };

  const post = async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(json?.error || json?.message || `Request gagal (${res.status})`);
    return json;
  };

  const handleCreateMahasiswa = async (e) => {
    e?.preventDefault();
    const err = validateMahasiswa(mahasiswa);
    if (err) return showToast("danger", "Validasi gagal", err);

    setLoading(true);
    try {
      const body = {
        nama: mahasiswa.nama.trim(),
        nrp: mahasiswa.nrp.trim(),
        jenis_kelamin: mahasiswa.jenis_kelamin,
        tahun_masuk: Number(mahasiswa.tahun_masuk),
        status: mahasiswa.status,
      };
      const res = await post("/mahasiswa", body);
      showToast("success", "Mahasiswa dibuat", res?.message || "Berhasil menambahkan mahasiswa");
      setMahasiswa(initialMahasiswa());
    } catch (err) {
      showToast("danger", "Gagal", err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDosen = async (e) => {
    e?.preventDefault();
    const err = validateDosen(dosen);
    if (err) return showToast("danger", "Validasi gagal", err);

    setLoading(true);
    try {
      const body = {
        nama: dosen.nama.trim(),
        nip: dosen.nip.trim(),
        jenis_kelamin: dosen.jenis_kelamin,
      };
      const res = await post("/dosen", body);
      showToast("success", "Dosen dibuat", res?.message || "Berhasil menambahkan dosen");
      setDosen(initialDosen());
    } catch (err) {
      showToast("danger", "Gagal", err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4 text-white">Sandbox CRUD — Mahasiswa & Dosen</h1>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("mahasiswa")}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
            tab === "mahasiswa"
              ? "bg-linear-to-b from-blue-600 to-blue-700 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Mahasiswa
        </button>
        <button
          type="button"
          onClick={() => setTab("dosen")}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
            tab === "dosen"
              ? "bg-linear-to-b from-blue-600 to-blue-700 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Dosen
        </button>
      </div>

      <div className="mb-4">
        <Toast
          open={!!toast}
          variant={toast?.variant}
          title={toast?.title}
          message={toast?.message}
          onClose={() => setToast(null)}
        />
      </div>

      {tab === "mahasiswa" ? (
        <form
          onSubmit={handleCreateMahasiswa}
          className="space-y-4 bg-white p-6 rounded-lg shadow-md text-slate-900"
        >
          <div>
            <label className="block text-sm font-medium">Nama</label>
            <input
              className="mt-1 block w-full p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              value={mahasiswa.nama}
              onChange={(e) => setMahasiswa({ ...mahasiswa, nama: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">NRP</label>
            <input
              className="mt-1 block w-full p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              value={mahasiswa.nrp}
              onChange={(e) => setMahasiswa({ ...mahasiswa, nrp: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium">Jenis Kelamin</label>
              <select
                className="mt-1 block w-full p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                value={mahasiswa.jenis_kelamin}
                onChange={(e) => setMahasiswa({ ...mahasiswa, jenis_kelamin: e.target.value })}
              >
                <option value="L">L</option>
                <option value="P">P</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Tahun Masuk</label>
              <input
                type="number"
                className="mt-1 block w-full p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                value={mahasiswa.tahun_masuk}
                onChange={(e) => setMahasiswa({ ...mahasiswa, tahun_masuk: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                className="mt-1 block w-full p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                value={mahasiswa.status}
                onChange={(e) => setMahasiswa({ ...mahasiswa, status: e.target.value })}
              >
                <option value="aktif">aktif</option>
                <option value="lulus">lulus</option>
                <option value="dropout">dropout</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Buat Mahasiswa"}
            </button>
            <button
              type="button"
              onClick={() => setMahasiswa(initialMahasiswa())}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700"
            >
              Reset
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleCreateDosen}
          className="space-y-4 bg-white p-6 rounded-lg shadow-md text-slate-900"
        >
          <div>
            <label className="block text-sm font-medium">Nama</label>
            <input
              className="mt-1 block w-full p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              value={dosen.nama}
              onChange={(e) => setDosen({ ...dosen, nama: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">NIP</label>
            <input
              className="mt-1 block w-full p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              value={dosen.nip}
              onChange={(e) => setDosen({ ...dosen, nip: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Jenis Kelamin</label>
            <select
              className="mt-1 block w-full p-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              value={dosen.jenis_kelamin}
              onChange={(e) => setDosen({ ...dosen, jenis_kelamin: e.target.value })}
            >
              <option value="L">L</option>
              <option value="P">P</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Buat Dosen"}
            </button>
            <button
              type="button"
              onClick={() => setDosen(initialDosen())}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700"
            >
              Reset
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
