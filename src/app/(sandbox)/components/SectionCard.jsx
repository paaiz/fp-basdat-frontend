"use client";

export default function SectionCard({ title, description, children }) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-6 text-slate-900 shadow-lg ring-1 ring-slate-200">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
