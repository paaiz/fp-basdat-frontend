"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { setAuth } from "@/lib/auth";

const API_BASE = "https://fp-basdat-backend.vercel.app/api";

export default function SignInPage() {
  const router = useRouter();

  const [role, setRole] = useState("mahasiswa");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (variant, message, title) => {
    setToast({ variant, message, title });
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const getEndpoint = () => (role === "mahasiswa" ? "/mahasiswa" : "/dosen");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}${getEndpoint()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || json?.message || "Gagal mengambil data login");
      }

      const list = Array.isArray(json?.data) ? json.data : [];
      const normalizedInput = identifier.trim();
      const normalizedPassword = password.trim();

      const matchedUser = list.find((item) => {
        const nrp = String(item?.nrp ?? "").trim();
        const nip = String(item?.nip ?? "").trim();
        const nama = String(item?.nama ?? "").trim();

        return role === "mahasiswa"
          ? nrp === normalizedInput && nama === normalizedPassword
          : nip === normalizedInput && nama === normalizedPassword;
      });

      if (!matchedUser) {
        showToast("danger", "NRP/NIP atau password salah", "Login gagal");
        return;
      }

      setAuth({
        role,
        id: matchedUser?.id ?? matchedUser?._id ?? null,
        name: matchedUser?.nama ?? "",
      });

      showToast("success", "Login berhasil", "Berhasil");
      router.push(role === "mahasiswa" ? "/dashboard/mahasiswa" : "/dashboard/dosen");
    } catch (err) {
      showToast("danger", err?.message || "Terjadi kesalahan", "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white text-slate-900">
      <div className="mb-4">
        <Toast
          open={!!toast}
          variant={toast?.variant}
          title={toast?.title}
          message={toast?.message}
          onClose={() => setToast(null)}
        />
      </div>

      <h1 className="mb-4 text-xl font-semibold">Sign In</h1>

      <div className="mb-4 flex gap-2" role="tablist" aria-label="Pilih peran">
        <button
          type="button"
          onClick={() => setRole("mahasiswa")}
          aria-pressed={role === "mahasiswa"}
          className={`flex-1 rounded-lg px-3 py-2 font-medium transition ${
            role === "mahasiswa"
              ? "bg-linear-to-b from-blue-600 to-blue-700 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Mahasiswa
        </button>
        <button
          type="button"
          onClick={() => setRole("dosen")}
          aria-pressed={role === "dosen"}
          className={`flex-1 rounded-lg px-3 py-2 font-medium transition ${
            role === "dosen"
              ? "bg-linear-to-b from-blue-600 to-blue-700 text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Dosen
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium">
            {role === "mahasiswa" ? "NRP" : "NIP"}
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={role === "mahasiswa" ? "Masukkan NRP" : "Masukkan NIP"}
              required
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
