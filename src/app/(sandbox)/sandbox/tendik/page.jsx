"use client";

import { useState } from "react";
import Toast from "@/components/ui/Toast";
import FormActions from "../../components/FormActions";
import { Field, Input, Textarea } from "../../components/FormFields";
import SectionCard from "../../components/SectionCard";
import SandboxShell from "../../components/SandboxShell";
import useTimedToast from "../../components/useTimedToast";
import { initialTendik, postJson, sanitizeText } from "../../components/sandboxConfig";

export default function TendikCreatePage() {
  const [tendik, setTendik] = useState(initialTendik());
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
    </SandboxShell>
  );
}
