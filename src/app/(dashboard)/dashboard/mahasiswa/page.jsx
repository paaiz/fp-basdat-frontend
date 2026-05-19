"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineUser,
} from "react-icons/hi2";
import { getAuth } from "@/lib/auth";
import { asItem, asList, getJson } from "../../components/dashboardApi";
import { SectionHeader } from "../../components/DashboardCard";
import { safeText, toShortName } from "../../components/dashboardFormat";
import MahasiswaAttendanceTab from "../../components/KehadiranMahasiswa/MahasiswaAttendanceTab";
import MahasiswaFinanceTab from "../../components/KeuanganMahasiswa/MahasiswaFinanceTab";

const WEEK_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const ACTIVE_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const DAY_CANONICAL = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};

function parseJsonArrayText(value) {
  if (Array.isArray(value)) return value;

  const raw = String(value ?? "").trim();
  if (!raw) return [];

  if (!(raw.startsWith("[") && raw.endsWith("]"))) {
    return [raw];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return [raw];
  }
}

function normalizeDayLabel(value) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  return DAY_CANONICAL[key] || safeText(value, "Senin");
}

function extractDayTokens(value) {
  const normalizedArray = parseJsonArrayText(value);
  if (normalizedArray.length > 1) {
    return normalizedArray.map((item) => normalizeDayLabel(item));
  }

  const raw = String(normalizedArray[0] ?? value ?? "").trim();
  if (!raw) return [];

  return raw
    .split(/[,&/]|\band\b|\bdan\b/gi)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => normalizeDayLabel(token));
}

function normalizeTimeText(start, end, fallback) {
  const s = String(start ?? "").trim();
  const e = String(end ?? "").trim();

  if (s || e) {
    return [s, e].filter(Boolean).join(" - ");
  }

  return safeText(fallback, "");
}

function normalizeRoomText(primary, fallback) {
  return safeText(primary || fallback, "Ruangan belum diatur");
}

function resolveLecturerName(classItem, dosenMap) {
  const directName = classItem?.nama_dosen || classItem?.dosen?.nama;
  if (directName) return safeText(directName);

  const dosenId = classItem?.id_dosen;
  if (dosenId != null) {
    const fromMap = dosenMap[String(dosenId)];
    if (fromMap) return safeText(fromMap);
  }

  return "Dosen belum tersedia";
}

function normalizeScheduleEntries(classItem, dosenMap) {
  const lecturer = resolveLecturerName(classItem, dosenMap);
  const title = safeText(classItem?.nama_kelas);
  const code = safeText(classItem?.kode_kelas);

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
        lecturer,
        title,
        code,
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
        lecturer,
        title,
        code,
      })),
    );
  }

  const fallbackDays = extractDayTokens(classItem?.hari_kuliah ?? classItem?.hari_text);
  if (fallbackDays.length) {
    return fallbackDays.map((day) => ({
      day,
      time: normalizeTimeText(classItem?.jam_mulai, classItem?.jam_selesai, classItem?.jam),
      room: normalizeRoomText(classItem?.ruangan, classItem?.room),
      lecturer,
      title,
      code,
    }));
  }

  return [];
}

function parseAttendanceData(payload) {
  const data = asItem(payload) || {};
  return {
    hadir: Number(data?.hadir ?? data?.total_hadir ?? data?.present ?? 0),
    izin: Number(data?.izin ?? data?.total_izin ?? 0),
    sakit: Number(data?.sakit ?? data?.total_sakit ?? 0),
    alpha: Number(data?.alpha ?? data?.total_alpha ?? 0),
    percentage: Number(data?.persentase ?? data?.percentage ?? 0),
    status: safeText(data?.status ?? data?.keterangan ?? "Memenuhi"),
  };
}

function sortBySemesterDesc(list) {
  return [...list].sort((a, b) => Number(b?.semester ?? 0) - Number(a?.semester ?? 0));
}

export default function MahasiswaDashboardPage() {
  const [auth, setAuthState] = useState(null);
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [dosenMap, setDosenMap] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [uktHistory, setUktHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState("Senin");
  const [activeTab, setActiveTab] = useState("kehadiran");
  const [todayDay, setTodayDay] = useState("Senin");

  useEffect(() => {
    const currentAuth = getAuth();
    setAuthState(currentAuth);

    if (!currentAuth?.id) {
      setError("Sesi mahasiswa tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }

    const today = WEEK_DAYS[new Date().getDay() - 1] || "Senin";
    setTodayDay(today);
    setActiveDay(ACTIVE_DAYS.includes(today) ? today : "Senin");

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      const [profileResult, classResult, uktResult, dosenResult] = await Promise.allSettled([
        getJson(`/mahasiswa/${currentAuth.id}`),
        getJson(`/kelas/by-mahasiswa/${currentAuth.id}`),
        getJson(`/ukt/mahasiswa/${currentAuth.id}`),
        getJson("/dosen"),
      ]);

      if (!active) return;

      if (profileResult.status === "fulfilled") {
        setProfile(asItem(profileResult.value));
      }

      const nextClasses = classResult.status === "fulfilled" ? asList(classResult.value) : [];

      const dosenList = dosenResult.status === "fulfilled" ? asList(dosenResult.value) : [];
      const nextDosenMap = dosenList.reduce((acc, item) => {
        const id = item?.id ?? item?._id;
        if (id != null) {
          acc[String(id)] = safeText(item?.nama);
        }
        return acc;
      }, {});
      setDosenMap(nextDosenMap);

      const classIds = nextClasses
        .map((item) => item?.id ?? item?._id)
        .filter((value) => value != null);

      const classDetailResults = await Promise.allSettled(
        classIds.map((classId) => getJson(`/kelas/${classId}`)),
      );

      const mergedClasses = nextClasses.map((item, index) => {
        const detailPayload = classDetailResults[index];
        const detail =
          detailPayload?.status === "fulfilled" ? asItem(detailPayload.value) || {} : {};

        return {
          ...item,
          hari: item?.hari ?? detail?.hari,
          jam_mulai: item?.jam_mulai ?? detail?.jam_mulai,
          jam_selesai: item?.jam_selesai ?? detail?.jam_selesai,
          ruangan: item?.ruangan ?? detail?.ruangan,
          schedule: item?.schedule ?? detail?.schedule,
          nama_dosen: item?.nama_dosen ?? detail?.nama_dosen,
          id_dosen: item?.id_dosen ?? detail?.id_dosen,
        };
      });

      setClasses(mergedClasses);
      setUktHistory(
        uktResult.status === "fulfilled" ? sortBySemesterDesc(asList(uktResult.value)) : [],
      );

      const attendanceResults = await Promise.allSettled(
        classIds.map((classId) =>
          getJson(
            `/presensi/mahasiswa/percentage?id_mahasiswa=${currentAuth.id}&id_kelas=${classId}`,
          ),
        ),
      );

      if (!active) return;

      setAttendance(
        mergedClasses.map((item, index) => {
          const classId = item?.id ?? item?._id;
          const response = attendanceResults[index];
          const data =
            response?.status === "fulfilled"
              ? parseAttendanceData(response.value)
              : parseAttendanceData({});
          return {
            key: String(classId ?? index),
            classId,
            title: safeText(item?.nama_kelas),
            code: safeText(item?.kode_kelas),
            lecturer: resolveLecturerName(item, nextDosenMap),
            ...data,
          };
        }),
      );

      if (
        profileResult.status === "rejected" &&
        classResult.status === "rejected" &&
        uktResult.status === "rejected"
      ) {
        setError("Semua data dashboard gagal dimuat.");
      }

      setLoading(false);
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const displayName = safeText(profile?.nama || auth?.name || "Mahasiswa");
  const avatarText = toShortName(displayName);
  const semesterText = safeText(profile?.semester || uktHistory[0]?.semester || "-");
  const programStudi = safeText(profile?.program_studi || profile?.prodi || "Teknik Komedi");
  const nrp = safeText(profile?.nrp || auth?.identifier || auth?.nrp || "-");

  const scheduleEntries = useMemo(() => {
    const entries = classes.flatMap((item) => normalizeScheduleEntries(item, dosenMap));

    if (entries.length) {
      return entries;
    }

    return classes.map((item, index) => ({
      day: activeDay,
      time: "Waktu belum diatur",
      room: "Ruangan belum diatur",
      lecturer: resolveLecturerName(item, dosenMap),
      title: safeText(item?.nama_kelas, `Kelas ${index + 1}`),
      code: safeText(item?.kode_kelas),
    }));
  }, [classes, dosenMap, activeDay]);
  const daySchedules = scheduleEntries.filter(
    (item) => normalizeDayLabel(item.day) === normalizeDayLabel(activeDay),
  );

  return (
    <main className="min-h-[calc(100vh-81px)] bg-[#f9fafb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[14px] bg-[#155dfc] p-6 shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)]">
          <div className="flex  flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[10px] bg-[#eff6ff] text-[#155dfc]">
                <HiOutlineUser className="h-10 w-10" />
              </div>

              <div>
                <h1 className="text-2xl font-medium tracking-tight text-white sm:text-[24px]">
                  {displayName}
                </h1>
                <p className="mt-1 text-[14px] leading-6 text-white sm:text-white">NRP: {nrp}</p>

                <div className="mt-4 grid gap-3 text-sm text-white sm:grid-cols-2">
                  <div>
                    <p className="text-[14px] leading-5">Program Studi</p>
                    <p className="mt-1 text-[14px] font-medium leading-5 text-white">
                      {programStudi}
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] leading-5">Semester</p>
                    <p className="mt-1 text-[14px] font-medium leading-5 text-white">
                      {semesterText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        <section className="rounded-[14px] bg-white p-6 shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)]">
          <SectionHeader title="Jadwal Kuliah Mingguan" />

          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const active = activeDay === day;
              const isPrimaryDay = ACTIVE_DAYS.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={`rounded-[10px] px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[#155dfc] text-white shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_rgba(0,0,0,0.1)]"
                      : "bg-[#f3f4f6] text-[#364153] hover:bg-[#e5e7eb]"
                  } ${isPrimaryDay ? "" : "opacity-90"}`}
                >
                  {day}
                  {day === todayDay ? " • Hari Ini" : ""}
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-[10px] bg-slate-100" />
                <div className="h-20 animate-pulse rounded-[10px] bg-slate-100" />
                <div className="h-20 animate-pulse rounded-[10px] bg-slate-100" />
              </div>
            ) : daySchedules.length ? (
              daySchedules.map((item, index) => (
                <div
                  key={`${item.code}-${item.time}-${index}`}
                  className="rounded-[10px] border-l-4 border-[#2b7fff] bg-[#eff6ff] px-5 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-[16px] font-medium leading-6 text-[#101828]">
                          {item.title}
                        </h4>
                        <span className="rounded-[33554400px] bg-white px-3 py-1 text-[12px] text-[#4a5565]">
                          {item.code}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-[14px] leading-5 text-[#4a5565]">
                        <span className="inline-flex items-center gap-2">
                          <HiOutlineClock className="h-4 w-4" />
                          {item.time || "-"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <HiOutlineMapPin className="h-4 w-4" />
                          {item.room || "-"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <HiOutlineUser className="h-4 w-4" />
                          {item.lecturer || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[10px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
                Belum ada jadwal untuk hari {activeDay}.
              </div>
            )}
          </div>
        </section>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("kehadiran")}
            className={`flex h-12 items-center gap-2 rounded-[10px] px-6 text-[16px] font-medium shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)] transition ${
              activeTab === "kehadiran" ? "bg-[#155dfc] text-white" : "bg-white text-[#364153]"
            }`}
          >
            <HiOutlineCalendarDays className="h-5 w-5" />
            Kehadiran
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("keuangan")}
            className={`flex h-12 items-center gap-2 rounded-[10px] px-6 text-[16px] font-medium shadow-[0px_4px_3px_rgba(0,0,0,0.1),0px_2px_2px_rgba(0,0,0,0.1)] transition ${
              activeTab === "keuangan" ? "bg-[#155dfc] text-white" : "bg-white text-[#364153]"
            }`}
          >
            <HiOutlineBanknotes className="h-5 w-5" />
            Keuangan
          </button>
        </div>

        {activeTab === "kehadiran" ? (
          <MahasiswaAttendanceTab
            semesterText={semesterText}
            loading={loading}
            attendance={attendance}
          />
        ) : (
          <MahasiswaFinanceTab loading={loading} uktHistory={uktHistory} />
        )}
      </div>
    </main>
  );
}
