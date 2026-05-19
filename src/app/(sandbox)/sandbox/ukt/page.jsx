"use client";

import { useState } from "react";
import Toast from "@/components/ui/Toast";
import EntityTableCard from "../../components/EntityTableCard";
import FormActions from "../../components/FormActions";
import { Field, Input, Select } from "../../components/FormFields";
import SectionCard from "../../components/SectionCard";
import SandboxShell from "../../components/SandboxShell";
import useTimedToast from "../../components/useTimedToast";
import {
  initialUkt,
  parseInteger,
  postJson,
  sanitizeText,
  UKT_STATUSES,
} from "../../components/sandboxConfig";

export default function UktCreatePage() {
  const [ukt, setUkt] = useState(initialUkt());
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast, showToast, setToast } = useTimedToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idMahasiswa = parseInteger(ukt.id_mahasiswa);
    const semester = parseInteger(ukt.semester);
    const tahunAjaran = sanitizeText(ukt.tahun_ajaran);
    const nominalTagihan = Number(ukt.nominal_tagihan);

    if (!Number.isInteger(idMahasiswa) || idMahasiswa <= 0)
      return showToast("danger", "Validasi gagal", "ID mahasiswa tidak valid");
    if (!Number.isInteger(semester) || semester <= 0)
      return showToast("danger", "Validasi gagal", "Semester tidak valid");
    if (!tahunAjaran) return showToast("danger", "Validasi gagal", "Tahun ajaran wajib diisi");
    if (!Number.isFinite(nominalTagihan) || nominalTagihan <= 0)
      return showToast("danger", "Validasi gagal", "Nominal tagihan tidak valid");
    if (!UKT_STATUSES.includes(ukt.status_pembayaran))
      return showToast("danger", "Validasi gagal", "Status pembayaran tidak valid");

    setLoading(true);
    try {
      const res = await postJson("/ukt/tagihan", {
        id_mahasiswa: idMahasiswa,
        semester,
        tahun_ajaran: tahunAjaran,
        nominal_tagihan: nominalTagihan,
        status_pembayaran: ukt.status_pembayaran,
      });
      showToast("success", "Tagihan dibuat", res?.message || "Berhasil menambahkan UKT tagihan");
      setUkt(initialUkt());
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast("danger", "Gagal", err?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SandboxShell
      activeId="ukt"
      title="Modul UKT "
      description="Modul untuk endpoint /api/ukt/tagihan."
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

      <SectionCard title="Create UKT Tagihan" description="POST /api/ukt/tagihan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ID Mahasiswa">
              <Input
                type="number"
                value={ukt.id_mahasiswa}
                onChange={(e) => setUkt({ ...ukt, id_mahasiswa: e.target.value })}
                placeholder="1"
              />
            </Field>

            <Field label="Semester">
              <Input
                type="number"
                value={ukt.semester}
                onChange={(e) => setUkt({ ...ukt, semester: e.target.value })}
                placeholder="1"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tahun Ajaran">
              <Input
                value={ukt.tahun_ajaran}
                onChange={(e) => setUkt({ ...ukt, tahun_ajaran: e.target.value })}
                placeholder="2025/2026"
              />
            </Field>

            <Field label="Nominal Tagihan">
              <Input
                type="number"
                value={ukt.nominal_tagihan}
                onChange={(e) => setUkt({ ...ukt, nominal_tagihan: e.target.value })}
                placeholder="5000000"
              />
            </Field>
          </div>

          <Field label="Status Pembayaran">
            <Select
              value={ukt.status_pembayaran}
              onChange={(e) => setUkt({ ...ukt, status_pembayaran: e.target.value })}
            >
              {UKT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </Field>

          <FormActions
            submitLabel="Buat Tagihan"
            loading={loading}
            onReset={() => setUkt(initialUkt())}
          />
        </form>
      </SectionCard>

      <EntityTableCard
        title="Data UKT Tagihan"
        description="GET /api/ukt"
        endpoint="/ukt"
        refreshKey={refreshKey}
        editFields={[
          { key: "id_mahasiswa", label: "ID Mahasiswa", type: "number", placeholder: "1" },
          { key: "semester", label: "Semester", type: "number", placeholder: "1" },
          { key: "tahun_ajaran", label: "Tahun Ajaran", placeholder: "2025/2026" },
          {
            key: "nominal_tagihan",
            label: "Nominal Tagihan",
            type: "number",
            placeholder: "5000000",
          },
          {
            key: "status_pembayaran",
            label: "Status Pembayaran",
            type: "select",
            options: UKT_STATUSES.map((status) => ({ value: status, label: status })),
          },
        ]}
        columns={[
          { key: "id", label: "ID" },
          { key: "id_mahasiswa", label: "ID Mahasiswa" },
          { key: "semester", label: "Semester" },
          { key: "tahun_ajaran", label: "Tahun Ajaran" },
          { key: "nominal_tagihan", label: "Nominal" },
          { key: "status_pembayaran", label: "Status" },
        ]}
        emptyMessage="Belum ada data UKT tagihan."
      />
    </SandboxShell>
  );
}
