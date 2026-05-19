"use client";

import { useState } from "react";
import Toast from "@/components/ui/Toast";
import EntityTableCard from "../../components/EntityTableCard";
import FormActions from "../../components/FormActions";
import { Field, Input, Textarea } from "../../components/FormFields";
import SectionCard from "../../components/SectionCard";
import SandboxShell from "../../components/SandboxShell";
import useTimedToast from "../../components/useTimedToast";
import { initialTendik, postJson, sanitizeText } from "../../components/sandboxConfig";

export default function TendikCreatePage() {
  const [tendik, setTendik] = useState(initialTendik());
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast, showToast, setToast } = useTimedToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nama = sanitizeText(tendik.nama);
    const jabatan = sanitizeText(tendik.jabatan);

    if (!nama) return showToast("danger", "Validasi gagal", "Nama wajib diisi");
    if (!jabatan) return showToast("danger", "Validasi gagal", "Jabatan wajib diisi");

    setLoading(true);
    try {
      const res = await postJson("/tendik", { nama, jabatan });
      showToast("success", "Tendik dibuat", res?.message || "Berhasil menambahkan tendik");
      setTendik(initialTendik());
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast("danger", "Gagal", err?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SandboxShell
      activeId="tendik"
      title="Modul Tendik"
      description="Modul untuk endpoint /api/tendik."
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

      <SectionCard title="Create Tendik" description="POST /api/tendik">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama">
            <Input
              value={tendik.nama}
              onChange={(e) => setTendik({ ...tendik, nama: e.target.value })}
              placeholder="Nama tendik"
            />
          </Field>

          <Field label="Jabatan">
            <Textarea
              value={tendik.jabatan}
              onChange={(e) => setTendik({ ...tendik, jabatan: e.target.value })}
              rows={3}
              placeholder="Contoh: admin, keuangan, dan sarpras."
            />
          </Field>

          <FormActions
            submitLabel="Buat Tendik"
            loading={loading}
            onReset={() => setTendik(initialTendik())}
          />
        </form>
      </SectionCard>

      <EntityTableCard
        title="Data Tendik"
        description="GET /api/tendik"
        endpoint="/tendik"
        refreshKey={refreshKey}
        editFields={[
          { key: "nama", label: "Nama", placeholder: "Nama tendik" },
          {
            key: "jabatan",
            label: "Jabatan",
            type: "textarea",
            rows: 3,
            placeholder: "Contoh: admin, keuangan, dan sarpras.",
          },
        ]}
        columns={[
          { key: "id", label: "ID" },
          { key: "nama", label: "Nama" },
          { key: "jabatan", label: "Jabatan" },
        ]}
        emptyMessage="Belum ada data tendik."
      />
    </SandboxShell>
  );
}
