"use client";

import { useState } from "react";
import Toast from "@/components/ui/Toast";
import EntityTableCard from "../../components/EntityTableCard";
import FormActions from "../../components/FormActions";
import { Field, Input } from "../../components/FormFields";
import SectionCard from "../../components/SectionCard";
import SandboxShell from "../../components/SandboxShell";
import useTimedToast from "../../components/useTimedToast";
import {
  initialPresensi,
  parseInteger,
  postJson,
  toIsoDateTime,
} from "../../components/sandboxConfig";

export default function PresensiCreatePage() {
  const [presensi, setPresensi] = useState(initialPresensi());
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast, showToast, setToast } = useTimedToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idKelas = parseInteger(presensi.id_kelas);
    const waktuDibuka = toIsoDateTime(presensi.waktu_dibuka);
    const waktuDitutup = toIsoDateTime(presensi.waktu_ditutup);

    if (!Number.isInteger(idKelas) || idKelas <= 0)
      return showToast("danger", "Validasi gagal", "ID kelas tidak valid");
    if (!waktuDibuka) return showToast("danger", "Validasi gagal", "Waktu dibuka wajib diisi");
    if (!waktuDitutup) return showToast("danger", "Validasi gagal", "Waktu ditutup wajib diisi");
    if (new Date(waktuDitutup).getTime() <= new Date(waktuDibuka).getTime()) {
      return showToast("danger", "Validasi gagal", "Waktu ditutup harus setelah waktu dibuka");
    }

    setLoading(true);
    try {
      const res = await postJson("/presensi", {
        id_kelas: idKelas,
        waktu_dibuka: waktuDibuka,
        waktu_ditutup: waktuDitutup,
      });
      showToast(
        "success",
        "Presensi dibuat",
        res?.message || "Berhasil menambahkan presensi session",
      );
      setPresensi(initialPresensi());
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast("danger", "Gagal", err?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SandboxShell
      activeId="presensi"
      title="Modul Presensi Session"
      description="Modul untuk endpoint /api/presensi."
    >
      <div className="mb-4">
        <Toast
          open={!!toast}
          variant={toast?.variant}
          title={toast?.title}
          message={toast?.message}
          onClose={() => setToast(null)}
        />
      </div>

      <SectionCard title="Create Presensi Session" description="POST /api/presensi">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-1">
            <Field label="ID Kelas">
              <Input
                type="number"
                value={presensi.id_kelas}
                onChange={(e) => setPresensi({ ...presensi, id_kelas: e.target.value })}
                placeholder="1"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Waktu Dibuka" hint="Format lokal lalu dikirim sebagai ISO">
              <Input
                type="datetime-local"
                value={presensi.waktu_dibuka}
                onChange={(e) => setPresensi({ ...presensi, waktu_dibuka: e.target.value })}
              />
            </Field>

            <Field label="Waktu Ditutup" hint="Harus setelah waktu dibuka">
              <Input
                type="datetime-local"
                value={presensi.waktu_ditutup}
                onChange={(e) => setPresensi({ ...presensi, waktu_ditutup: e.target.value })}
              />
            </Field>
          </div>

          <FormActions
            submitLabel="Buat Presensi"
            loading={loading}
            onReset={() => setPresensi(initialPresensi())}
          />
        </form>
      </SectionCard>

      <EntityTableCard
        title="Data Presensi"
        description="GET /api/presensi"
        endpoint="/presensi"
        refreshKey={refreshKey}
        editFields={[
          { key: "id_kelas", label: "ID Kelas", type: "number", placeholder: "1" },
          { key: "waktu_dibuka", label: "Waktu Dibuka", type: "datetime-local" },
          { key: "waktu_ditutup", label: "Waktu Ditutup", type: "datetime-local" },
        ]}
        columns={[
          { key: "id", label: "ID" },
          { key: "id_kelas", label: "ID Kelas" },
          { key: "waktu_dibuka", label: "Waktu Dibuka" },
          { key: "waktu_ditutup", label: "Waktu Ditutup" },
        ]}
        emptyMessage="Belum ada data presensi."
      />
    </SandboxShell>
  );
}
