"use client";

export function DashboardCard({ title, subtitle, action, children, className = "" }) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function MetricCard({ label, value, hint, tone = "blue" }) {
  const tones = {
    blue: "from-sky-500 to-blue-600",
    amber: "from-amber-500 to-orange-500",
    emerald: "from-emerald-500 to-teal-500",
    slate: "from-slate-700 to-slate-900",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div
        className={`mb-3 h-1.5 w-16 rounded-full bg-gradient-to-r ${tones[tone] || tones.blue}`}
      />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-4">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">{eyebrow}</p>
      ) : null}
      <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
  );
}
