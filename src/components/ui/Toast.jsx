"use client";

const variants = {
  danger: "border-red-200 bg-red-50 text-red-700",
  primary: "border-blue-200 bg-blue-50 text-blue-700",
  secondary: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function Toast({ open = false, variant = "secondary", title, message, onClose }) {
  if (!open) return null;

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${variants[variant] ?? variants.secondary}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {title ? <p className="font-semibold">{title}</p> : null}
          {message ? <p className="mt-1 text-sm leading-6">{message}</p> : null}
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm font-medium opacity-70 hover:opacity-100"
            aria-label="Tutup notifikasi"
          >
            x
          </button>
        ) : null}
      </div>
    </div>
  );
}
