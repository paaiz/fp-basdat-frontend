"use client";

import { Field, Input, Select, Textarea } from "./FormFields";

function isDateTimeLike(value) {
  if (typeof value !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value);
}

export default function EntityEditModal({
  open,
  title,
  description,
  fields,
  values,
  onChange,
  onClose,
  onSubmit,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close modal overlay"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="border-b border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-white">
          <h3 className="text-xl font-semibold">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-300">{description}</p> : null}
        </div>

        <form onSubmit={onSubmit} className="max-h-[75vh] overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {fields.map((field) => {
              const currentValue = values[field.key] ?? "";
              const inputType =
                field.type || (isDateTimeLike(String(currentValue)) ? "datetime-local" : "text");

              return (
                <Field key={field.key} label={field.label} hint={field.hint}>
                  {field.type === "select" ? (
                    <Select
                      value={currentValue}
                      onChange={(e) => onChange(field.key, e.target.value)}
                    >
                      {(field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      rows={field.rows || 3}
                      value={currentValue}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <Input
                      type={inputType}
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      value={currentValue}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </Field>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
