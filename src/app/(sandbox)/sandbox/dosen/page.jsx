"use client";

import { useState } from "react";
import Toast from "@/components/ui/Toast";
import EntityTableCard from "../../components/EntityTableCard";
import FormActions from "../../components/FormActions";
import { Field, Input, Select } from "../../components/FormFields";
import SectionCard from "../../components/SectionCard";
import SandboxShell from "../../components/SandboxShell";
import useTimedToast from "../../components/useTimedToast";
import { initialDosen, postJson, sanitizeText } from "../../components/sandboxConfig";

export default function DosenCreatePage() {
  const [dosen, setDosen] = useState(initialDosen());
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast, showToast, setToast } = useTimedToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nama = sanitizeText(dosen.nama);
    const nip = sanitizeText(dosen.nip);

    if (!nama) return showToast("danger", "Validasi gagal", "Nama wajib diisi");
    if (!nip) return showToast("danger", "Validasi gagal", "NIP wajib diisi");
    if (!["L", "P"].includes(dosen.jenis_kelamin))
      return showToast("danger", "Validasi gagal", "Jenis kelamin tidak valid");

    setLoading(true);
    try {
      const res = await postJson("/dosen", {
        nama,
        nip,
        jenis_kelamin: dosen.jenis_kelamin,
      });
      showToast("success", "Dosen dibuat", res?.message || "Berhasil menambahkan dosen");
      setDosen(initialDosen());
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast("danger", "Gagal", err?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SandboxShell
      activeId="dosen"
      title="Modul Dosen"
      description="Modul untuk endpoint /api/dosen."
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

      <SectionCard title="Create Dosen" description="POST /api/dosen">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama">
            <Input
              value={dosen.nama}
              onChange={(e) => setDosen({ ...dosen, nama: e.target.value })}
              placeholder="Nama dosen"
            />
          </Field>

          <Field label="NIP">
            <Input
              value={dosen.nip}
              onChange={(e) => setDosen({ ...dosen, nip: e.target.value })}
              placeholder="NIP"
            />
          </Field>

          <Field label="Jenis Kelamin">
            <Select
              value={dosen.jenis_kelamin}
              onChange={(e) => setDosen({ ...dosen, jenis_kelamin: e.target.value })}
            >
              <option value="L">L</option>
              <option value="P">P</option>
            </Select>
          </Field>

          <FormActions
            submitLabel="Buat Dosen"
            loading={loading}
            onReset={() => setDosen(initialDosen())}
          />
        </form>
      </SectionCard>

      <EntityTableCard
        title="Data Dosen"
        description="GET /api/dosen"
        endpoint="/dosen"
        refreshKey={refreshKey}
        editFields={[
          { key: "nama", label: "Nama", placeholder: "Nama dosen" },
          { key: "nip", label: "NIP", placeholder: "NIP" },
          {
            key: "jenis_kelamin",
            label: "Jenis Kelamin",
            type: "select",
            options: [
              { value: "L", label: "L" },
              { value: "P", label: "P" },
            ],
          },
        ]}
        columns={[
          { key: "id", label: "ID" },
          { key: "nama", label: "Nama" },
          { key: "nip", label: "NIP" },
          { key: "jenis_kelamin", label: "JK" },
        ]}
        emptyMessage="Belum ada data dosen."
      />
    </SandboxShell>
  );
}
