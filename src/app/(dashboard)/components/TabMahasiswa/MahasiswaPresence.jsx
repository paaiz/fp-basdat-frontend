"use client";

import { useState, useEffect } from "react";

import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

import { DashboardCard } from "../DashboardCard";
import { postJson, putJson, getJson } from "@/app/(sandbox)/components/sandboxConfig";

import Toast from "@/components/ui/Toast";
import useTimedToast from "@/app/(sandbox)/components/useTimedToast";
import { getAuth } from "@/lib/auth";

export default function MahasiswaPresence({ loading, sessions = [], mahasiswaId }) {
  const [formData, setFormData] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [submittedSessions, setSubmittedSessions] = useState({});
  const [auth, setAuth] = useState(getAuth());
  const { toast, showToast, setToast } = useTimedToast();

  useEffect(() => {
    const checkPresensi = async () => {
      const result = {};

      await Promise.all(
        sessions.map(async (session) => {
          try {
            const response = await getJson(`/presensi/${session.id}/mahasiswa`);

            const mahasiswaList = response?.data || [];

            const mahasiswa = mahasiswaList.find(
              (item) => String(item.nrp) === String(auth?.identifier),
            );

            result[session.id] = Number(mahasiswa?.sudah_presensi ?? 0) === 1;
          } catch (error) {
            console.log("Gagal cek presensi untuk session", session.id, error);
            result[session.id] = false;
          }
        }),
      );

      setSubmittedSessions(result);
    };

    if (sessions.length) {
      checkPresensi();
    }
  }, [sessions]);

  const updateForm = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        status: prev[id]?.status || "hadir",
        alasan: prev[id]?.alasan || "",
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (session) => {
    const form = formData[session.id] || {
      status: "hadir",
      alasan: "",
    };

    if ((form.status === "izin" || form.status === "sakit") && !form.alasan.trim()) {
      alert("Alasan wajib diisi.");
      return;
    }

    try {
      setSubmittingId(session.id);

      await putJson(`/presensi/stamp`, {
        id_mahasiswa: mahasiswaId,
        id_presensi: session.id,
        status: form.status,
        alasan: form.status === "hadir" ? "hadir" : form.alasan.trim(),
      });

      showToast("success", "Presensi berhasil dikirim.");

      setSubmittedSessions((prev) => ({
        ...prev,
        [session.id]: true,
      }));

      setFormData((prev) => ({
        ...prev,
        [session.id]: {
          status: "hadir",
          alasan: "",
        },
      }));
    } catch (err) {
      console.log(err);
      showToast("danger", "Gagal mengirim presensi.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <DashboardCard
      title="Presensi Aktif"
      subtitle="Daftar sesi presensi yang saat ini masih dibuka oleh dosen."
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-36 animate-pulse rounded-[14px] bg-slate-100" />
          <div className="h-36 animate-pulse rounded-[14px] bg-slate-100" />
        </div>
      ) : sessions.length ? (
        <div className="space-y-4">
          <Toast
            open={!!toast}
            variant={toast?.variant}
            title={toast?.title}
            message={toast?.message}
            onClose={() => setToast(null)}
          />

          {sessions.map((session) => {
            const sudahPresensi = submittedSessions[session.id];

            const form = formData[session.id] || {
              status: "hadir",
              alasan: "",
            };

            return (
              <div key={session.id} className="rounded-[14px] border border-slate-200 bg-white p-5">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <HiOutlineCheckCircle className="h-5 w-5 text-[#155dfc]" />

                    <div className="flex items-center justify-center gap-3">
                      <h3 className="text-[16px] font-medium text-[#101828]">
                        {session.nama_kelas} ({session.kode_kelas})
                      </h3>

                      <p className="text-[#155dfc] font-medium">
                        Pertemuan {session.pertemuan > 0 ? session.pertemuan : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#4a5565]">
                    <span className="inline-flex items-center gap-2">
                      <HiOutlineClock className="h-4 w-4" />
                      Dibuka: {new Date(session.waktu_dibuka).toLocaleString("id-ID")}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <HiOutlineClock className="h-4 w-4" />
                      Ditutup: {new Date(session.waktu_ditutup).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black">
                      Status Kehadiran
                    </label>

                    <select
                      value={form.status}
                      onChange={(e) => updateForm(session.id, "status", e.target.value)}
                      className="w-full text-black rounded-[10px] border border-[#d1d5dc] px-3 py-2 outline-none focus:border-[#155dfc]"
                    >
                      <option value="hadir">Hadir</option>
                      <option value="izin">Izin</option>
                      <option value="sakit">Sakit</option>
                    </select>
                  </div>

                  {(form.status === "izin" || form.status === "sakit") && (
                    <div>
                      <label className="mb-2 text-black block text-sm font-medium">Alasan</label>

                      <textarea
                        value={form.alasan}
                        onChange={(e) => updateForm(session.id, "alasan", e.target.value)}
                        rows={3}
                        placeholder="Tuliskan alasan..."
                        className="w-full text-black rounded-[10px] border border-[#d1d5dc] px-3 py-2 outline-none focus:border-[#155dfc]"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={submittingId === session.id || sudahPresensi}
                    onClick={() => handleSubmit(session)}
                    className="rounded-[10px] bg-[#155dfc] px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingId === session.id
                      ? "Mengirim..."
                      : sudahPresensi
                        ? "Sudah Presensi"
                        : "Kirim Presensi"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[10px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationTriangle className="h-5 w-5" />
            Tidak ada sesi presensi yang sedang aktif.
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
