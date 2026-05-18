"use client";

import { useState } from "react";
import Toast from "@/components/ui/Toast";
import FormActions from "../../components/FormActions";
import { Field, Input, Select } from "../../components/FormFields";
import SectionCard from "../../components/SectionCard";
import SandboxShell from "../../components/SandboxShell";
import useTimedToast from "../../components/useTimedToast";
import {
  initialMahasiswa,
  postJson,
  sanitizeText,
  parseInteger,
} from "../../components/sandboxConfig";

export default function MahasiswaCreatePage() {
  const [mahasiswa, setMahasiswa] = useState(initialMahasiswa());
  const [loading, setLoading] = useState(false);
  const { toast, showToast, setToast } = useTimedToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nama = sanitizeText(mahasiswa.nama);
    const nrp = sanitizeText(mahasiswa.nrp);
    const tahunMasuk = parseInteger(mahasiswa.tahun_masuk);

    if (!nama) return showToast("danger", "Validasi gagal", "Nama wajib diisi");
    if (!nrp) return showToast("danger", "Validasi gagal", "NRP wajib diisi");
    if (!["L", "P"].includes(mahasiswa.jenis_kelamin))
      return showToast("danger", "Validasi gagal", "Jenis kelamin tidak valid");
    if (!Number.isInteger(tahunMasuk) || tahunMasuk < 1900)
      return showToast("danger", "Validasi gagal", "Tahun masuk tidak valid");
    if (!["aktif", "lulus", "dropout"].includes(mahasiswa.status))
      return showToast("danger", "Validasi gagal", "Status tidak valid");

    setLoading(true);
    try {
      const res = await postJson("/mahasiswa", {
        nama,
        nrp,
        jenis_kelamin: mahasiswa.jenis_kelamin,
        tahun_masuk: tahunMasuk,
        status: mahasiswa.status,
      });
      showToast("success", "Mahasiswa dibuat", res?.message || "Berhasil menambahkan mahasiswa");
      setMahasiswa(initialMahasiswa());
    } catch (err) {
      showToast("danger", "Gagal", err?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SandboxShell
      activeId="mahasiswa"
      title="Modul Mahasiswa"
      description="Modul untuk endpoint /api/mahasiswa."
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

      <SectionCard title="Create Mahasiswa" description="POST /api/mahasiswa">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama">
            <Input
              value={mahasiswa.nama}
              onChange={(e) => setMahasiswa({ ...mahasiswa, nama: e.target.value })}
              placeholder="Nama mahasiswa"
            />
          </Field>

          <Field label="NRP">
            <Input
              value={mahasiswa.nrp}
              onChange={(e) => setMahasiswa({ ...mahasiswa, nrp: e.target.value })}
              placeholder="NRP"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Jenis Kelamin">
              <Select
                value={mahasiswa.jenis_kelamin}
                onChange={(e) => setMahasiswa({ ...mahasiswa, jenis_kelamin: e.target.value })}
              >
                <option value="L">L</option>
                <option value="P">P</option>
              </Select>
            </Field>

            <Field label="Tahun Masuk">
              <Input
                type="number"
                value={mahasiswa.tahun_masuk}
                onChange={(e) => setMahasiswa({ ...mahasiswa, tahun_masuk: e.target.value })}
                placeholder="2026"
              />
            </Field>

            <Field label="Status">
              <Select
                value={mahasiswa.status}
                onChange={(e) => setMahasiswa({ ...mahasiswa, status: e.target.value })}
              >
                <option value="aktif">aktif</option>
                <option value="lulus">lulus</option>
                <option value="dropout">dropout</option>
              </Select>
            </Field>
          </div>

          <FormActions
            submitLabel="Buat Mahasiswa"
            loading={loading}
            onReset={() => setMahasiswa(initialMahasiswa())}
          />
        </form>
      </SectionCard>
    </SandboxShell>
  );
}
