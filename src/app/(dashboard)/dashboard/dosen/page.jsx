"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth";
import { asItem, asList, getJson } from "../../components/dashboardApi";
import { safeText } from "../../components/dashboardFormat";
import DosenDashboardView from "../../components/DosenDashboard/DosenDashboardView";

const WEEK_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

function getClassId(item, index = 0) {
  return String(item?.id ?? item?._id ?? `class-${index}`);
}

function parseAttendanceData(payload) {
  const data = asItem(payload) || payload || {};
  const percentage = Number(data?.persentase ?? data?.percentage ?? 0);
  const derivedStatus = percentage >= 75 ? "Memenuhi" : "Tidak Memenuhi";

  return {
    hadir: Number(data?.hadir ?? data?.total_hadir ?? data?.present ?? 0),
    izin: Number(data?.izin ?? data?.total_izin ?? 0),
    sakit: Number(data?.sakit ?? data?.total_sakit ?? 0),
    alpha: Number(data?.alpha ?? data?.total_alpha ?? 0),
    percentage,
    status: safeText(data?.status ?? data?.keterangan ?? derivedStatus),
  };
}

export default function DosenDashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState(null);
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState("Senin");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceByClass, setAttendanceByClass] = useState({});

  useEffect(() => {
    const currentAuth = getAuth();
    setAuth(currentAuth);

    if (!currentAuth?.id) {
      setError("Sesi dosen tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }

    const todayIndex = new Date().getDay() - 1;
    setActiveDay(WEEK_DAYS[todayIndex] || "Senin");

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      const [profileResult, classResult] = await Promise.allSettled([
        getJson(`/dosen/${currentAuth.id}`),
        getJson(`/kelas/by-dosen/${currentAuth.id}`),
      ]);

      if (!active) return;

      if (profileResult.status === "fulfilled") {
        setProfile(asItem(profileResult.value));
      }

      const baseClasses = classResult.status === "fulfilled" ? asList(classResult.value) : [];
      const classDetailResults = await Promise.allSettled(
        baseClasses.map((item, index) => getJson(`/kelas/${getClassId(item, index)}`)),
      );
      const classStudentResults = await Promise.allSettled(
        baseClasses.map((item, index) => getJson(`/kelas/${getClassId(item, index)}/mahasiswa`)),
      );

      if (!active) return;

      const mergedClasses = baseClasses.map((item, index) => {
        const classId = getClassId(item, index);
        const detail =
          classDetailResults[index]?.status === "fulfilled"
            ? asItem(classDetailResults[index].value) || {}
            : {};
        const studentList =
          classStudentResults[index]?.status === "fulfilled"
            ? asList(classStudentResults[index].value)
            : [];

        return {
          ...item,
          ...detail,
          id: item?.id ?? item?._id ?? detail?.id ?? detail?._id ?? classId,
          studentCount:
            studentList.length ||
            Number(item?.studentCount ?? detail?.studentCount ?? detail?.total_mahasiswa ?? 0),
        };
      });

      setClasses(mergedClasses);

      if (profileResult.status === "rejected" && classResult.status === "rejected") {
        setError("Data dashboard gagal dimuat.");
      }

      setLoading(false);
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!classes.length) return;

    const selectedExists = classes.some(
      (item, index) => getClassId(item, index) === selectedClassId,
    );
    if (!selectedClassId || !selectedExists) {
      setSelectedClassId(getClassId(classes[0], 0));
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (!selectedClassId || !auth?.id) return;

    let active = true;

    const loadAttendance = async () => {
      setLoadingAttendance(true);

      try {
        const [studentResult, detailResult] = await Promise.allSettled([
          getJson(`/kelas/${selectedClassId}/mahasiswa`),
          getJson(`/kelas/${selectedClassId}`),
        ]);

        const students = studentResult.status === "fulfilled" ? asList(studentResult.value) : [];
        const detail = detailResult.status === "fulfilled" ? asItem(detailResult.value) || {} : {};

        const attendanceResults = await Promise.allSettled(
          students.map((student) => {
            const studentId = student?.id ?? student?._id;
            return getJson(
              `/presensi/mahasiswa/percentage?id_mahasiswa=${studentId}&id_kelas=${selectedClassId}`,
            );
          }),
        );

        if (!active) return;

        const rows = students.map((student, index) => {
          const response = attendanceResults[index];
          const data =
            response?.status === "fulfilled"
              ? parseAttendanceData(response.value)
              : parseAttendanceData({});
          const percentage = Number.isFinite(data.percentage) ? data.percentage : 0;

          return {
            no: index + 1,
            id: student?.id ?? student?._id ?? `student-${index}`,
            nrp: safeText(student?.nrp),
            nama: safeText(student?.nama),
            ...data,
            percentage,
            status: safeText(data.status, percentage >= 75 ? "Memenuhi" : "Tidak Memenuhi"),
          };
        });

        setAttendanceByClass((prev) => ({
          ...prev,
          [selectedClassId]: {
            detail,
            rows,
          },
        }));
      } catch {
        if (active) {
          setAttendanceByClass((prev) => ({
            ...prev,
            [selectedClassId]: {
              detail: {},
              rows: [],
            },
          }));
        }
      } finally {
        if (active) setLoadingAttendance(false);
      }
    };

    loadAttendance();

    return () => {
      active = false;
    };
  }, [selectedClassId, auth?.id]);

  const handleLogout = () => {
    clearAuth();
    router.replace("/sign-in");
  };

  return (
    <DosenDashboardView
      auth={auth}
      profile={profile}
      classes={classes}
      loading={loading}
      loadingAttendance={loadingAttendance}
      error={error}
      activeDay={activeDay}
      setActiveDay={setActiveDay}
      selectedClassId={selectedClassId}
      setSelectedClassId={setSelectedClassId}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      attendanceByClass={attendanceByClass}
      onLogout={handleLogout}
    />
  );
}
