"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/ui/Toast";
import EntityTableCard from "../../components/EntityTableCard";
import FormActions from "../../components/FormActions";
import { Field, Input, Select } from "../../components/FormFields";
import SectionCard from "../../components/SectionCard";
import SandboxShell from "../../components/SandboxShell";
import useTimedToast from "../../components/useTimedToast";
import {
  ALLOWED_DAYS,
  createScheduleRow,
  getJson,
  initialKelasEnroll,
  initialKelas,
  parseInteger,
  postJson,
  sanitizeText,
} from "../../components/sandboxConfig";

export default function KelasCreatePage() {
  const [kelas, setKelas] = useState(initialKelas());
  const [enroll, setEnroll] = useState(initialKelasEnroll());
  const [refreshKey, setRefreshKey] = useState(0);
  const [dosenOptions, setDosenOptions] = useState([]);
  const [mahasiswaOptions, setMahasiswaOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [loadingDosen, setLoadingDosen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  const [loadingReference, setLoadingReference] = useState(false);
  const { toast, showToast, setToast } = useTimedToast();

  useEffect(() => {
    let active = true;

    const loadDosen = async () => {
      setLoadingDosen(true);
      try {
        const res = await getJson("/dosen");
        const list = Array.isArray(res?.data) ? res.data : [];

        if (!active) return;
        setDosenOptions(list);
      } catch (err) {
        if (active) {
          showToast(
            "danger",
            "Gagal memuat dosen",
            err?.message || "Terjadi kesalahan saat mengambil data dosen",
          );
        }
      } finally {
        if (active) setLoadingDosen(false);
      }
    };

    const loadReferences = async () => {
      setLoadingReference(true);
      try {
        const [mahasiswaRes, kelasRes] = await Promise.all([
          getJson("/mahasiswa"),
          getJson("/kelas"),
        ]);

        if (!active) return;
        setMahasiswaOptions(Array.isArray(mahasiswaRes?.data) ? mahasiswaRes.data : []);
        setKelasOptions(Array.isArray(kelasRes?.data) ? kelasRes.data : []);
      } catch (err) {
        if (active) {
          showToast(
            "danger",
            "Gagal memuat referensi",
            err?.message || "Terjadi kesalahan saat mengambil data mahasiswa/kelas",
          );
        }
      } finally {
        if (active) setLoadingReference(false);
      }
    };

    loadDosen();
    loadReferences();

    return () => {
      active = false;
    };
  }, [showToast]);

  const updateKelasRow = (index, key, value) => {
    setKelas((prev) => ({
      ...prev,
      schedule: prev.schedule.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    }));
  };

  const addKelasRow = () =>
    setKelas((prev) => ({ ...prev, schedule: [...prev.schedule, createScheduleRow()] }));

  const removeKelasRow = (index) => {
    setKelas((prev) => ({
      ...prev,
      schedule:
        prev.schedule.length > 1
          ? prev.schedule.filter((_, rowIndex) => rowIndex !== index)
          : prev.schedule,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const kodeKelas = sanitizeText(kelas.kode_kelas);
    const namaKelas = sanitizeText(kelas.nama_kelas);
    const idDosen = parseInteger(kelas.id_dosen);

    if (!kodeKelas) return showToast("danger", "Validasi gagal", "Kode kelas wajib diisi");
    if (!namaKelas) return showToast("danger", "Validasi gagal", "Nama kelas wajib diisi");
    if (!Number.isInteger(idDosen) || idDosen <= 0)
      return showToast("danger", "Validasi gagal", "Dosen belum dipilih atau tidak valid");

    const normalizedSchedule = kelas.schedule.map((row) => ({
      hari: sanitizeText(row.hari),
      jam_mulai: sanitizeText(row.jam_mulai),
      jam_selesai: sanitizeText(row.jam_selesai),
      ruangan: sanitizeText(row.ruangan),
    }));

    if (normalizedSchedule.some((row) => !ALLOWED_DAYS.includes(row.hari)))
      return showToast("danger", "Validasi gagal", "Hari kelas tidak valid");
    if (normalizedSchedule.some((row) => !row.jam_mulai || !row.jam_selesai || !row.ruangan)) {
      return showToast("danger", "Validasi gagal", "Semua jadwal kelas harus diisi");
    }

    setLoading(true);
    try {
      const res = await postJson("/kelas", {
        kode_kelas: kodeKelas,
        nama_kelas: namaKelas,
        id_dosen: idDosen,
        hari: normalizedSchedule.map((row) => row.hari),
        jam_mulai: normalizedSchedule.map((row) => row.jam_mulai),
        jam_selesai: normalizedSchedule.map((row) => row.jam_selesai),
        ruangan: normalizedSchedule.map((row) => row.ruangan),
      });
      showToast("success", "Kelas dibuat", res?.message || "Berhasil menambahkan kelas");
      setKelas(initialKelas());
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast("danger", "Gagal", err?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();

    const idMahasiswa = parseInteger(enroll.id_mahasiswa);
    const idKelas = parseInteger(enroll.id_kelas);
    const semester = parseInteger(enroll.semester);

    if (!Number.isInteger(idMahasiswa) || idMahasiswa <= 0)
      return showToast("danger", "Validasi gagal", "Mahasiswa belum dipilih atau tidak valid");
    if (!Number.isInteger(idKelas) || idKelas <= 0)
      return showToast("danger", "Validasi gagal", "Kelas belum dipilih atau tidak valid");
    if (!Number.isInteger(semester) || semester <= 0)
      return showToast("danger", "Validasi gagal", "Semester tidak valid");

    setLoadingEnroll(true);
    try {
      const res = await postJson("/kelas/enroll", {
        id_mahasiswa: idMahasiswa,
        id_kelas: idKelas,
        semester,
      });
      showToast(
        "success",
        "Enroll berhasil",
        res?.message || "Mahasiswa berhasil didaftarkan ke kelas",
      );
      setEnroll(initialKelasEnroll());
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast("danger", "Gagal enroll", err?.message || "Terjadi kesalahan");
    } finally {
      setLoadingEnroll(false);
    }
  };

  return (
    <SandboxShell
      activeId="kelas"
      title="Modul Kelas"
      description="Modul untuk endpoint /api/kelas."
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

      <SectionCard title="Create Kelas" description="POST /api/kelas">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kode Kelas">
              <Input
                value={kelas.kode_kelas}
                onChange={(e) => setKelas({ ...kelas, kode_kelas: e.target.value })}
                placeholder="IF-101"
              />
            </Field>

            <Field label="Nama Kelas">
              <Input
                value={kelas.nama_kelas}
                onChange={(e) => setKelas({ ...kelas, nama_kelas: e.target.value })}
                placeholder="Basis Data"
              />
            </Field>
          </div>

          <Field
            label="Dosen"
            hint={loadingDosen ? "Memuat data dosen..." : "Pilih dosen dari daftar"}
          >
            <Select
              value={kelas.id_dosen}
              onChange={(e) => setKelas({ ...kelas, id_dosen: e.target.value })}
              disabled={loadingDosen}
            >
              <option value="">Pilih dosen</option>
              {dosenOptions.map((item) => {
                const id = item?.id ?? item?._id ?? "";
                const label = [id, item?.nama].filter(Boolean).join(" - ");

                return (
                  <option key={String(id)} value={String(id)}>
                    {label || String(id)}
                  </option>
                );
              })}
            </Select>
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-800">Jadwal Kelas</h3>
                <p className="text-sm text-slate-500">
                  Setiap baris akan dikirim sebagai array ke API.
                </p>
              </div>
              <button
                type="button"
                onClick={addKelasRow}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Tambah Jadwal
              </button>
            </div>

            <div className="space-y-3">
              {kelas.schedule.map((row, index) => (
                <div
                  key={`${index}-${row.hari}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-700">Jadwal {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeKelasRow(index)}
                      disabled={kelas.schedule.length === 1}
                      className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <Field label="Hari">
                      <Select
                        value={row.hari}
                        onChange={(e) => updateKelasRow(index, "hari", e.target.value)}
                      >
                        {ALLOWED_DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label="Jam Mulai">
                      <Input
                        type="time"
                        value={row.jam_mulai}
                        onChange={(e) => updateKelasRow(index, "jam_mulai", e.target.value)}
                      />
                    </Field>

                    <Field label="Jam Selesai">
                      <Input
                        type="time"
                        value={row.jam_selesai}
                        onChange={(e) => updateKelasRow(index, "jam_selesai", e.target.value)}
                      />
                    </Field>

                    <Field label="Ruangan">
                      <Input
                        value={row.ruangan}
                        onChange={(e) => updateKelasRow(index, "ruangan", e.target.value)}
                        placeholder="Ruang 301"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <FormActions
            submitLabel="Buat Kelas"
            loading={loading}
            onReset={() => setKelas(initialKelas())}
          />
        </form>
      </SectionCard>

      <SectionCard title="Enroll Mahasiswa ke Kelas" description="POST /api/kelas/enroll">
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Mahasiswa"
              hint={loadingReference ? "Memuat data mahasiswa..." : "Pilih mahasiswa dari daftar"}
            >
              <Select
                value={enroll.id_mahasiswa}
                onChange={(e) => setEnroll((prev) => ({ ...prev, id_mahasiswa: e.target.value }))}
                disabled={loadingReference}
              >
                <option value="">Pilih mahasiswa</option>
                {mahasiswaOptions.map((item) => {
                  const id = item?.id ?? item?._id ?? "";
                  const label = [item?.nrp, item?.nama].filter(Boolean).join(" - ");

                  return (
                    <option key={String(id)} value={String(id)}>
                      {label || String(id)}
                    </option>
                  );
                })}
              </Select>
            </Field>

            <Field
              label="Kelas"
              hint={loadingReference ? "Memuat data kelas..." : "Pilih kelas yang akan diambil"}
            >
              <Select
                value={enroll.id_kelas}
                onChange={(e) => setEnroll((prev) => ({ ...prev, id_kelas: e.target.value }))}
                disabled={loadingReference}
              >
                <option value="">Pilih kelas</option>
                {kelasOptions.map((item) => {
                  const id = item?.id ?? item?._id ?? "";
                  const label = [item?.kode_kelas, item?.nama_kelas].filter(Boolean).join(" - ");

                  return (
                    <option key={String(id)} value={String(id)}>
                      {label || String(id)}
                    </option>
                  );
                })}
              </Select>
            </Field>
          </div>

          <Field label="Semester">
            <Input
              type="number"
              value={enroll.semester}
              onChange={(e) => setEnroll((prev) => ({ ...prev, semester: e.target.value }))}
              placeholder="1"
            />
          </Field>

          <FormActions
            submitLabel="Enroll Mahasiswa"
            loading={loadingEnroll}
            onReset={() => setEnroll(initialKelasEnroll())}
          />
        </form>
      </SectionCard>

      <EntityTableCard
        title="Data Kelas"
        description="GET /api/kelas"
        endpoint="/kelas"
        refreshKey={refreshKey}
        editFields={[
          { key: "kode_kelas", label: "Kode Kelas", placeholder: "IF-101" },
          { key: "nama_kelas", label: "Nama Kelas", placeholder: "Basis Data" },
          {
            key: "id_dosen",
            label: "Dosen",
            type: "select",
            options: dosenOptions.map((item) => {
              const id = item?.id ?? item?._id ?? "";
              return {
                value: String(id),
                label: [id, item?.nama].filter(Boolean).join(" - ") || String(id),
              };
            }),
          },
        ]}
        columns={[
          { key: "id", label: "ID" },
          { key: "kode_kelas", label: "Kode" },
          { key: "nama_kelas", label: "Nama Kelas" },
          { key: "id_dosen", label: "ID Dosen" },
          { key: "hari", label: "Hari" },
          { key: "jam_mulai", label: "Jam Mulai" },
          { key: "jam_selesai", label: "Jam Selesai" },
          { key: "ruangan", label: "Ruangan" },
        ]}
        emptyMessage="Belum ada data kelas."
      />
    </SandboxShell>
  );
}
