"use client";

export default function FormActions({ submitLabel, loading, loadingLabel = "Menyimpan...", onReset }) {
  return (
    <div className="flex gap-2">
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? loadingLabel : submitLabel}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-300"
      >
        Reset
      </button>
    </div>
  );
}