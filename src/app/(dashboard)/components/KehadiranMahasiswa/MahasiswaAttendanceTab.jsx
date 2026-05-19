"use client";

import { DashboardCard } from "../DashboardCard";

function AttendanceChip({ tone, children }) {
  const tones = {
    green: "bg-[#dcfce7] text-[#008236]",
    blue: "bg-[#dbeafe] text-[#1447e6]",
    amber: "bg-[#fef9c2] text-[#a65f00]",
    red: "bg-[#ffe2e2] text-[#c10007]",
  };

  return (
    <span
      className={`inline-flex min-w-10 items-center justify-center gap-1 rounded-full px-3 py-1 text-sm ${tones[tone] || tones.green}`}
    >
      {children}
    </span>
  );
}

export default function MahasiswaAttendanceTab({ semesterText, loading, attendance }) {
  return (
    <DashboardCard title={`Rekap Kehadiran Semester ${semesterText}`}>
      <div className="overflow-hidden rounded-[14px] border border-slate-200">
        <table className="min-w-full table-fixed text-left text-sm">
          <thead className="border-b border-slate-200 bg-white text-[#4a5565]">
            <tr className="font-bold uppercase tracking-wide">
              <th className="px-4 py-3 text-[12px] font-bold">Mata Kuliah</th>
              <th className="px-4 py-3 text-[12px] font-bold">Dosen</th>
              <th className="px-4 py-3 text-center text-[12px] font-bold">Hadir</th>
              <th className="px-4 py-3 text-center text-[12px] font-bold">Izin</th>
              <th className="px-4 py-3 text-center text-[12px] font-bold">Sakit</th>
              <th className="px-4 py-3 text-center text-[12px] font-bold">Alpha</th>
              <th className="px-4 py-3 text-center text-[12px] font-bold">Persentase</th>
              <th className="px-4 py-3 text-center text-[12px] font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6] bg-white">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Memuat data kehadiran...
                </td>
              </tr>
            ) : attendance.length ? (
              attendance.map((row) => {
                const statusTone =
                  row.percentage >= 75 ? "green" : row.percentage >= 60 ? "amber" : "red";

                return (
                  <tr key={row.key} className="align-middle">
                    <td className="px-4 py-5 align-top">
                      <div>
                        <p className="text-[16px] font-normal leading-6 text-[#101828]">
                          {row.title}
                        </p>
                        <p className="mt-1 text-[14px] leading-5 text-[#6a7282]">{row.code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[14px] leading-5 text-[#4a5565]">
                      {row.lecturer}
                    </td>
                    <td className="px-4 py-5 text-center">
                      <AttendanceChip tone="green">{row.hadir}</AttendanceChip>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <AttendanceChip tone="blue">{row.izin}</AttendanceChip>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <AttendanceChip tone="amber">{row.sakit}</AttendanceChip>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <AttendanceChip tone="red">{row.alpha}</AttendanceChip>
                    </td>
                    <td className="px-4 py-5 text-center text-[16px] text-[#101828]">
                      {Number.isFinite(row.percentage) ? `${row.percentage.toFixed(1)}%` : "-"}
                    </td>
                    <td className="px-4 py-5 text-center">
                      <AttendanceChip tone={statusTone}>{row.status}</AttendanceChip>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Belum ada data rekap kehadiran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-[10px] bg-[#eff6ff] px-4 py-3 text-sm text-[#155dfc]">
        <span className="font-medium">Catatan:</span> Minimal kehadiran 75% untuk dapat mengikuti
        ujian akhir semester.
      </div>
    </DashboardCard>
  );
}
