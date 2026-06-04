"use client";

import { DashboardCard } from "../DashboardCard";
import { formatCurrency, formatDateTime, safeText } from "../dashboardFormat";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from "react-icons/hi";

export default function MahasiswaFinanceTab({ loading, uktHistory }) {
  const latestUkt = uktHistory[0];

  const resolvePaidAmount = (item) => {
    const nominal = Number(item?.nominal_tagihan ?? 0);
    const rawPaid = Number(item?.nominal_dibayar ?? item?.dibayar);
    const status = String(item?.status_pembayaran ?? "").toLowerCase();

    if (status === "lunas") {
      return Number.isFinite(rawPaid) && rawPaid > 0 ? rawPaid : nominal;
    }

    return Number.isFinite(rawPaid) && rawPaid >= 0 ? rawPaid : 0;
  };

  const totalTagihan = uktHistory.reduce(
    (sum, item) => sum + Number(item?.nominal_tagihan ?? 0),
    0,
  );
  const totalDibayar = uktHistory.reduce((sum, item) => sum + resolvePaidAmount(item), 0);
  const totalOutstanding = uktHistory.reduce((sum, item) => {
    const nominal = Number(item?.nominal_tagihan ?? 0);
    const paid = resolvePaidAmount(item);
    const status = String(item?.status_pembayaran ?? "").toLowerCase();

    if (status === "lunas") return sum;

    if (status === "sebagian") {
      const remaining = Math.max(0, nominal - paid);
      return sum + remaining;
    }

    return sum + nominal;
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-medium text-slate-500">Total Tagihan</p>
            <p className="mt-2 wrap-break-word text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {loading ? "..." : formatCurrency(totalTagihan)}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Akumulasi semua tagihan yang tercatat.
            </p>
          </div>

          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-medium text-slate-500">Total Dibayar</p>
            <p className="mt-2 wrap-break-word text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {loading ? "..." : formatCurrency(totalDibayar)}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Jumlah pembayaran yang sudah masuk.
            </p>
          </div>

          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-medium text-slate-500">Sisa Tagihan</p>
            <p className="mt-2 wrap-break-word text-2xl font-semibold tracking-tight text-[#e7000b] sm:text-3xl">
              {loading ? "..." : formatCurrency(totalOutstanding)}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Total tunggakan yang harus dilunasi.
            </p>
          </div>
        </div>
      </div>

      <DashboardCard
        title="Riwayat Pembayaran UKT"
        subtitle="Tagihan semester dan status pembayaran mahasiswa."
        action={<div className="text-sm font-medium text-[#6a7282]">{uktHistory.length} data</div>}
      >
        <div className="space-y-3">
          {loading ? (
            <>
              <div className="h-20 animate-pulse rounded-[10px] bg-slate-100" />
              <div className="h-20 animate-pulse rounded-[10px] bg-slate-100" />
            </>
          ) : uktHistory.length ? (
            uktHistory.map((item) => (
              <div
                key={String(item?.id ?? item?._id ?? `${item?.semester}-${item?.tahun_ajaran}`)}
                className="border border-[#e5e7eb] rounded-[10px] bg-white p-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  <p className="text-[16px] font-medium text-[#101828]">
                    Semester {safeText(item?.semester)} ({safeText(item?.tahun_ajaran)})
                  </p>
                  <div className="mt-2 text-[14px] text-[#4a5565] flex flex-wrap gap-6">
                    <span>Nominal: {formatCurrency(item?.nominal_tagihan)}</span>
                    <span>Dibayar: {formatCurrency(resolvePaidAmount(item))}</span>
                    {/* <span>
                      Tanggal:{" "}
                      {item?.tanggal ||
                        item?.tanggal_pembayaran ||
                        formatDateTime(item?.updated_at || item?.created_at) ||
                        "-"}
                    </span> */}
                  </div>
                </div>

                <div className="ml-4 shrink-0">
                  {item?.status_pembayaran === "lunas" ? (
                    <div className="bg-[#dcfce7] rounded-[10px] px-4 py-2 flex items-center gap-2 text-[#008236]">
                      <HiOutlineCheckCircle className="h-5 w-5" />
                      <span className="font-medium">Lunas</span>
                    </div>
                  ) : item?.status_pembayaran === "sebagian" ? (
                    <div className="bg-[#fef9c2] rounded-[10px] px-4 py-2 flex items-center gap-2 text-[#a65f00]">
                      <HiOutlineClock className="h-5 w-5" />
                      <span className="font-medium">Sebagian</span>
                    </div>
                  ) : (
                    <div className="bg-[#ffe2e2] rounded-[10px] px-4 py-2 flex items-center gap-2 text-[#c10007]">
                      <HiOutlineXCircle className="h-5 w-5" />
                      <span className="font-medium">Belum Lunas</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[10px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
              Riwayat pembayaran UKT belum tersedia.
            </div>
          )}

          {!loading && totalOutstanding > 0 ? (
            <div className="bg-[#fef2f2] border border-[#ffc9c9] rounded-[10px] px-4 py-3 text-sm text-[#9f0712]">
              <strong>Perhatian:</strong> Anda memiliki tunggakan UKT sebesar{" "}
              {formatCurrency(totalOutstanding)}. Segera lakukan pembayaran untuk menghindari sanksi
              akademik.
            </div>
          ) : null}
        </div>
      </DashboardCard>
    </div>
  );
}
