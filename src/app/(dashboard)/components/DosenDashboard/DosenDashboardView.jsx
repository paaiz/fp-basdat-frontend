"use client";

import { useMemo, useState, useEffect } from "react";

import {
  initialPresensi,
  toIsoDateTime,
  postJson,
  getJson,
} from "@/app/(sandbox)/components/sandboxConfig";

import { asList } from "@/app/(dashboard)/components/dashboardApi";

import FormActions from "@/app/(sandbox)/components/FormActions";

import {
  HiOutlineBookOpen,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineXCircle,
} from "react-icons/hi2";

import {
  DashboardCard,
  MetricCard,
  SectionHeader,
} from "@/app/(dashboard)/components/DashboardCard";

import { safeText } from "@/app/(dashboard)/components/dashboardFormat";

import {
  extractDayTokens,
  normalizeDayLabel,
  normalizeRoomText,
  parseJsonArrayText,
  normalizeTimeText,
  WEEK_DAYS,
} from "@/lib/util";

import { Field, Input } from "@/app/(sandbox)/components/FormFields";

import Toast from "@/components/ui/Toast";
import useTimedToast from "@/app/(sandbox)/components/useTimedToast";

function getClassId(item, index = 0) {
  return String(item?.id ?? item?._id ?? `class-${index}`);
}

function resolveScheduleEntries(classItem) {
  const title = safeText(classItem?.nama_kelas, "Mata kuliah");
  const code = safeText(classItem?.kode_kelas, "-");
  const studentCount = Number(classItem?.studentCount ?? classItem?.total_mahasiswa ?? 0);

  const scheduleRows = [
    ...(Array.isArray(classItem?.schedule) ? classItem.schedule : []),
    ...(Array.isArray(classItem?.jadwal) ? classItem.jadwal : []),
    ...(Array.isArray(classItem?.jadwal_kelas) ? classItem.jadwal_kelas : []),
  ];

  if (scheduleRows.length) {
    return scheduleRows.flatMap((row) => {
      const days = extractDayTokens(row?.hari ?? row?.day ?? row?.hari_kelas);
      const dayList = days.length ? days : ["Senin"];

      return dayList.map((day) => ({
        day,
        time: normalizeTimeText(
          row?.jam_mulai ?? row?.mulai ?? row?.start_time,
          row?.jam_selesai ?? row?.selesai ?? row?.end_time,
          row?.jam ?? row?.waktu,
        ),
        room: normalizeRoomText(
          row?.ruangan ?? row?.room ?? row?.kelas_ruangan,
          classItem?.ruangan,
        ),
        title,
        code,
        studentCount,
      }));
    });
  }

  const days = parseJsonArrayText(classItem?.hari);
  const starts = parseJsonArrayText(classItem?.jam_mulai);
  const ends = parseJsonArrayText(classItem?.jam_selesai);
  const rooms = parseJsonArrayText(classItem?.ruangan);

  if (days.length) {
    return days.flatMap((day, index) =>
      extractDayTokens(day).map((token) => ({
        day: token,
        time: normalizeTimeText(starts[index], ends[index], classItem?.jam),
        room: normalizeRoomText(rooms[index], classItem?.ruangan),
        title,
        code,
        studentCount,
      })),
    );
  }

  const fallbackDays = extractDayTokens(classItem?.hari_kuliah ?? classItem?.hari_text);
  if (fallbackDays.length) {
    return fallbackDays.map((day) => ({
      day,
      time: normalizeTimeText(classItem?.jam_mulai, classItem?.jam_selesai, classItem?.jam),
      room: normalizeRoomText(classItem?.ruangan, classItem?.room),
      title,
      code,
      studentCount,
    }));
  }

  return [];
}

function ClassCard({ item, active, onClick }) {
  const badge = safeText(
    item?.classBadge || item?.rombel || item?.kelas_label || item?.group,
    "Kelas",
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-3xl border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(15,23,42,0.08)] ${
        active ? "border-sky-300 ring-1 ring-sky-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-[10px] bg-[#e0e7ff] text-[#4f39f6]">
            <HiOutlineBookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#101828]">
              {safeText(item?.nama_kelas, "Mata Kuliah")}
            </p>
            <p className="mt-1 text-sm font-medium text-[#6a7282]">
              {safeText(item?.kode_kelas, "-")}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-[#4a5565]">
              <HiOutlineUsers className="h-4 w-4" />
              <span>{Number(item?.studentCount ?? 0)} Mahasiswa</span>
            </div>
          </div>
        </div>
        <span className="rounded-[33554400px] bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {badge}
        </span>
      </div>
    </button>
  );
}

function AttendancePill({ tone, icon, children }) {
  const classes = {
    green: "bg-[#dcfce7] text-[#008236]",
    blue: "bg-[#dbeafe] text-[#1447e6]",
    amber: "bg-[#fef9c2] text-[#a65f00]",
    red: "bg-[#ffe2e2] text-[#c10007]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[33554400px] px-3 py-1 text-sm ${classes[tone] || classes.green}`}
    >
      {icon}
      {children}
    </span>
  );
}

export default function DosenDashboardView({
  profile,
  classes,
  loading,
  loadingAttendance,
  error,
  activeDay,
  setActiveDay,
  selectedClassId,
  setSelectedClassId,
  searchTerm,
  setSearchTerm,
  attendanceByClass,
  onLogout,
}) {
  const [presensi, setPresensi] = useState(initialPresensi());
  const [presensiList, setPresensiList] = useState([]);
  const [loadingPresensi, setLoadingPresensi] = useState(false);
  const { toast, showToast, setToast } = useTimedToast();

  const currentProfile = profile || {};
  const displayName = safeText(currentProfile?.nama, "Dosen");
  const nip = safeText(currentProfile?.nip, "-");
  const fakultas = safeText(currentProfile?.fakultas || currentProfile?.jabatan, "F-ELECTICS");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idKelas = Number(selectedClassId);
    const waktuDibuka = toIsoDateTime(presensi.waktu_dibuka);
    const waktuDitutup = toIsoDateTime(presensi.waktu_ditutup);

    if (!idKelas) return showToast("danger", "Validasi gagal", "Pilih kelas terlebih dahulu");
    if (!waktuDibuka) return showToast("danger", "Validasi gagal", "Waktu dibuka wajib diisi");
    if (!waktuDitutup) return showToast("danger", "Validasi gagal", "Waktu ditutup wajib diisi");
    if (new Date(waktuDitutup).getTime() <= new Date(waktuDibuka).getTime()) {
      return showToast("danger", "Validasi gagal", "Waktu ditutup harus setelah waktu dibuka");
    }

    setLoadingPresensi(true);
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

      const refreshed = await getJson(`/presensi/by-kelas/${selectedClassId}`);

      setPresensiList(asList(refreshed));
    } catch (err) {
      showToast("danger", "Gagal", err?.message || "Terjadi kesalahan");
    } finally {
      setLoadingPresensi(false);
    }
  };

  const selectedClassEntry = useMemo(() => {
    return (
      classes.find((item, index) => getClassId(item, index) === selectedClassId) ||
      classes[0] ||
      null
    );
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (!selectedClassId) return;

    const loadPresensi = async () => {
      try {
        setLoadingPresensi(true);

        const res = await getJson(`/presensi/by-kelas/${selectedClassId}`);

        setPresensiList(asList(res));
      } catch (err) {
        setPresensiList([]);
      } finally {
        setLoadingPresensi(false);
      }
    };

    loadPresensi();
  }, [selectedClassId]);

  const selectedClassAttendance = attendanceByClass[selectedClassId]?.rows || [];

  const scheduleEntries = useMemo(() => {
    return classes.flatMap((item) => resolveScheduleEntries(item));
  }, [classes]);

  const daySchedules = scheduleEntries.filter(
    (item) => normalizeDayLabel(item.day) === normalizeDayLabel(activeDay),
  );

  const selectedClassBadge = useMemo(() => {
    if (!selectedClassEntry) return "Kelas";

    return safeText(
      selectedClassEntry?.classBadge ||
        selectedClassEntry?.rombel ||
        selectedClassEntry?.kelas_label ||
        selectedClassEntry?.group,
      safeText(selectedClassEntry?.kode_kelas, "Kelas"),
    );
  }, [selectedClassEntry]);

  const filteredAttendance = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return selectedClassAttendance;

    return selectedClassAttendance.filter((row) => {
      return [row?.nrp, row?.nama]
        .map((value) => String(value ?? "").toLowerCase())
        .some((value) => value.includes(query));
    });
  }, [searchTerm, selectedClassAttendance]);

  const attendanceSummary = useMemo(() => {
    const total = selectedClassAttendance.length;
    const memenuhi = selectedClassAttendance.filter(
      (row) => Number(row?.percentage ?? 0) >= 75,
    ).length;
    const tidakMemenuhi = total - memenuhi;
    const average = total
      ? selectedClassAttendance.reduce((sum, row) => sum + Number(row?.percentage ?? 0), 0) / total
      : 0;

    return {
      total,
      memenuhi,
      tidakMemenuhi,
      average,
    };
  }, [selectedClassAttendance]);

  const lowAttendanceCount = attendanceSummary.tidakMemenuhi;
  const todayDay = WEEK_DAYS[new Date().getDay() - 1] || "Senin";

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-6">
        {error ? (
          <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-[14px] bg-linear-to-r from-[#155dfc] from-[16.346%] to-[#4f39f6] to-[72.115%] p-6 shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(255,255,255,0.2)]">
              <HiOutlineUser className="h-12 w-12 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-[24px] font-medium leading-8 text-white">{displayName}</h1>
              <p className="mt-1 text-[16px] leading-6 text-[#e0e7ff]">NIP: {nip}</p>

              <div className="mt-4 grid gap-4 text-sm text-[#e0e7ff] sm:grid-cols-2 lg:max-w-xl">
                <div>
                  <p className="text-[14px] leading-5">Fakultas</p>
                  <p className="mt-1 text-[14px] font-medium leading-5 text-white">{fakultas}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DashboardCard
          title="Jadwal Mengajar Mingguan"
          subtitle="Jadwal kelas dan lokasi mengajar dosen pada minggu berjalan."
        >
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const active = activeDay === day;
              const isToday = day === todayDay;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={`rounded-[10px] px-5 py-2 items-center  gap-2 flex text-left text-sm font-medium transition ${
                    active
                      ? "bg-[#4f39f6] text-white shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_rgba(0,0,0,0.1)]"
                      : "bg-[#f3f4f6] text-[#364153] hover:bg-slate-200"
                  }`}
                >
                  <span className="block leading-5">{day}</span>
                  {isToday ? (
                    <span className="block text-xs leading-4 opacity-90">• Hari Ini</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <>
                <div className="h-20 animate-pulse rounded-[10px] bg-slate-100" />
                <div className="h-20 animate-pulse rounded-[10px] bg-slate-100" />
              </>
            ) : daySchedules.length ? (
              daySchedules.map((item, index) => (
                <div
                  key={`${item.title}-${item.code}-${item.time}-${index}`}
                  className="rounded-[10px] border-l-4 border-[#155dfc] bg-[#eef2ff] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-[16px] font-medium leading-6 text-[#101828]">
                          {item.title}
                        </h3>
                        <span className="rounded-[33554400px] bg-white px-3 py-1 text-[12px] text-[#4a5565]">
                          {item.code}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-[14px] leading-5 text-[#4a5565]">
                        <span className="inline-flex items-center gap-2">
                          <HiOutlineClock className="h-4 w-4" />
                          {item.time}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <HiOutlineMapPin className="h-4 w-4" />
                          {item.room}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <HiOutlineUsers className="h-4 w-4" />
                          {item.studentCount} Mahasiswa
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[10px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
                Belum ada jadwal pada hari {activeDay}.
              </div>
            )}
          </div>
        </DashboardCard>

        <section>
          <SectionHeader
            title="Mata Kuliah yang Diampu"
            description="Kelas aktif yang sedang diampu pada semester berjalan."
          />

          <div className="grid gap-4 xl:grid-cols-3">
            {loading ? (
              <>
                <div className="h-45 animate-pulse rounded-[14px] bg-white shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_rgba(0,0,0,0.1)]" />
                <div className="h-45 animate-pulse rounded-[14px] bg-white shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_rgba(0,0,0,0.1)]" />
                <div className="h-45 animate-pulse rounded-[14px] bg-white shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_rgba(0,0,0,0.1)]" />
              </>
            ) : classes.length ? (
              classes.map((item, index) => (
                <ClassCard
                  key={getClassId(item, index)}
                  item={item}
                  active={getClassId(item, index) === selectedClassId}
                  onClick={() => setSelectedClassId(getClassId(item, index))}
                />
              ))
            ) : (
              <div className="rounded-[14px] border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 xl:col-span-3">
                Belum ada kelas yang diampu.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          <MetricCard
            label="Total Mahasiswa"
            value={loadingAttendance ? "..." : attendanceSummary.total}
            hint="Jumlah mahasiswa aktif pada kelas terpilih."
          />
          <MetricCard
            label="Memenuhi Syarat"
            value={loadingAttendance ? "..." : attendanceSummary.memenuhi}
            hint="Persentase kehadiran minimal 75%."
            textColor="text-emerald-600"
          />
          <MetricCard
            label="Tidak Memenuhi"
            value={loadingAttendance ? "..." : attendanceSummary.tidakMemenuhi}
            hint="Mahasiswa yang belum lolos ambang hadir."
            textColor="text-red-600"
          />
          <MetricCard
            label="Rata-rata Kehadiran"
            value={loadingAttendance ? "..." : `${attendanceSummary.average.toFixed(1)}%`}
            hint="Rata-rata kehadiran untuk kelas terpilih."
          />
        </section>

        <DashboardCard
          title={`Buat Presensi Kelas - ${safeText(selectedClassEntry?.nama_kelas, "-")} (${selectedClassBadge})`}
          subtitle="Kelola sesi presensi untuk kelas yang sedang dipilih."
        >
          <Toast
            open={!!toast}
            variant={toast?.variant}
            title={toast?.title}
            message={toast?.message}
            onClose={() => setToast(null)}
          />

          <form onSubmit={handleSubmit} className="space-y-4">
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
        </DashboardCard>

        <DashboardCard
          title={`Daftar Presensi - ${safeText(selectedClassEntry?.nama_kelas, "-")}`}
          subtitle="Riwayat sesi presensi yang pernah dibuat."
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Dibuka</th>
                  <th className="px-4 py-3 text-left">Ditutup</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {loadingPresensi ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : presensiList.length ? (
                  presensiList.map((item) => {
                    const aktif = new Date(item.waktu_ditutup) > new Date();

                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3">{item.id}</td>

                        <td className="px-4 py-3">
                          {new Date(item.waktu_dibuka).toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          {new Date(item.waktu_ditutup).toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          {aktif ? (
                            <span className="text-green-600">Aktif</span>
                          ) : (
                            <span className="text-red-600">Ditutup</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Belum ada sesi presensi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <DashboardCard
          title={`Rekap Kehadiran Mahasiswa - ${safeText(selectedClassEntry?.nama_kelas, "-")} (${selectedClassBadge})`}
          subtitle="Gunakan pencarian untuk memfilter mahasiswa pada kelas terpilih."
        >
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-[320px]">
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari mahasiswa..."
                className="h-10.5 w-full rounded-[10px] border border-[#d1d5dc] pl-10 pr-4 text-[16px] outline-none transition focus:border-[#155dfc] focus:ring-2 focus:ring-[#155dfc]/15"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="border-b border-[#e5e7eb] text-[14px] font-bold text-[#4a5565]">
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">NRP</th>
                  <th className="px-4 py-3">Nama Mahasiswa</th>
                  <th className="px-4 py-3 text-center">Hadir</th>
                  <th className="px-4 py-3 text-center">Izin</th>
                  <th className="px-4 py-3 text-center">Sakit</th>
                  <th className="px-4 py-3 text-center">Alpha</th>
                  <th className="px-4 py-3 text-center">Persentase</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingAttendance ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
                      Memuat rekap kehadiran...
                    </td>
                  </tr>
                ) : filteredAttendance.length ? (
                  filteredAttendance.map((row) => {
                    const memenuhi = Number(row?.percentage ?? 0) >= 75;

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-[#f3f4f6] text-[16px] text-[#4a5565]"
                      >
                        <td className="px-4 py-4 align-middle">{row.no}</td>
                        <td className="px-4 py-4 align-middle text-[#101828]">{row.nrp}</td>
                        <td className="px-4 py-4 align-middle text-[#101828]">{row.nama}</td>
                        <td className="px-4 py-4 align-middle text-center">
                          <AttendancePill
                            tone="green"
                            icon={<HiOutlineCheckCircle className="h-4 w-4" />}
                          >
                            {row.hadir}
                          </AttendancePill>
                        </td>
                        <td className="px-4 py-4 align-middle text-center">
                          <AttendancePill tone="blue" icon={<HiOutlineClock className="h-4 w-4" />}>
                            {row.izin}
                          </AttendancePill>
                        </td>
                        <td className="px-4 py-4 align-middle text-center">
                          <AttendancePill
                            tone="amber"
                            icon={<HiOutlineClock className="h-4 w-4" />}
                          >
                            {row.sakit}
                          </AttendancePill>
                        </td>
                        <td className="px-4 py-4 align-middle text-center">
                          <AttendancePill
                            tone="red"
                            icon={<HiOutlineXCircle className="h-4 w-4" />}
                          >
                            {row.alpha}
                          </AttendancePill>
                        </td>
                        <td
                          className={`px-4 py-4 align-middle text-center font-medium ${
                            memenuhi ? "text-[#00a63e]" : "text-[#e7000b]"
                          }`}
                        >
                          {Number(row?.percentage ?? 0).toFixed(1)}%
                        </td>
                        <td className="px-4 py-4 align-middle text-center">
                          {memenuhi ? (
                            <AttendancePill
                              tone="green"
                              icon={<HiOutlineCheckCircle className="h-4 w-4" />}
                            >
                              Memenuhi
                            </AttendancePill>
                          ) : (
                            <AttendancePill
                              tone="red"
                              icon={<HiOutlineXCircle className="h-4 w-4" />}
                            >
                              Tidak Memenuhi
                            </AttendancePill>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
                      Belum ada data mahasiswa pada kelas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loadingAttendance && lowAttendanceCount > 0 ? (
            <div className="mt-4 rounded-[10px] border border-[#f1d26f] bg-[#fff8db] px-4 py-3 text-sm text-[#a65f00]">
              <strong>Perhatian:</strong> Terdapat {lowAttendanceCount} mahasiswa dengan kehadiran
              di bawah 75%. Mahasiswa tersebut tidak memenuhi syarat untuk mengikuti ujian akhir
              semester.
            </div>
          ) : null}
        </DashboardCard>
      </main>
    </div>
  );
}
