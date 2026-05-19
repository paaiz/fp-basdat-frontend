"use client";

import { DashboardCard, MetricCard } from "../DashboardCard";
import { formatCurrency, formatDateTime, safeText } from "../dashboardFormat";

export default function MahasiswaFinanceTab({ loading, uktHistory }) {
  const latestUkt = uktHistory[0];
  const unpaidCount = uktHistory.filter((item) => item?.status_pembayaran !== "lunas").length;
  const totalOutstanding = uktHistory.reduce((sum, item) => {
    if (item?.status_pembayaran === "lunas") return sum;
    const amount = Number(item?.nominal_tagihan ?? 0);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);

  const financeCards = [
    {
      label: "Total Tagihan",
      value: formatCurrency(
        uktHistory.reduce((sum, item) => sum + Number(item?.nominal_tagihan ?? 0), 0),
      ),
      hint: "Akumulasi semua tagihan yang tercatat.",
      tone: "blue",
    },
    {
      label: "Belum Lunas",
      value: unpaidCount,
      hint: formatCurrency(totalOutstanding),
      tone: "amber",
    },
    {
      label: "Status Terbaru",
      value: safeText(latestUkt?.status_pembayaran || "belum_dibayar"),
      hint: latestUkt ? `Semester ${safeText(latestUkt?.semester)}` : "Tidak ada tagihan.",
      tone: "emerald",
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
      <div className="grid gap-4">
        {financeCards.map((item) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={loading ? "..." : item.value}
            hint={item.hint}
            tone={item.tone}
          />
        ))}
      </div>

      <DashboardCard
        title="Histori UKT"
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
            uktHistory.slice(0, 4).map((item) => (
              <div
                key={String(item?.id ?? item?._id ?? `${item?.semester}-${item?.tahun_ajaran}`)}
                className="rounded-[10px] border border-slate-200 bg-[#eff6ff] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[16px] font-medium text-[#101828]">
                      Semester {safeText(item?.semester)}
                    </p>
                    <p className="mt-1 text-[14px] text-[#6a7282]">
                      {safeText(item?.tahun_ajaran)}
                    </p>
                  </div>
                  <span
                    className={`rounded-[33554400px] px-3 py-1 text-[12px] font-medium ${item?.status_pembayaran === "lunas" ? "bg-[#dcfce7] text-[#008236]" : item?.status_pembayaran === "sebagian" ? "bg-[#fef9c2] text-[#a65f00]" : "bg-[#ffe2e2] text-[#c10007]"}`}
                  >
                    {safeText(item?.status_pembayaran)}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.18em] text-[#6a7282]">
                      Nominal
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#101828]">
                      {formatCurrency(item?.nominal_tagihan)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.18em] text-[#6a7282]">
                      Terakhir Update
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-[#101828]">
                      {formatDateTime(item?.updated_at || item?.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[10px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
              Histori UKT belum tersedia.
            </div>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
