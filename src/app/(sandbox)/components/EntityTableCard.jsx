"use client";

import { useCallback, useEffect, useState } from "react";
import EntityEditModal from "./EntityEditModal";
import SectionCard from "./SectionCard";
import { deleteJson, getJson, putJson } from "./sandboxConfig";

function readPath(obj, path) {
  if (!path) return undefined;
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function formatCellValue(value) {
  if (value == null || value === "") return "-";

  if (Array.isArray(value)) {
    if (!value.length) return "-";
    if (value.every((item) => ["string", "number", "boolean"].includes(typeof item))) {
      return value.join(", ");
    }
    return JSON.stringify(value);
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatEditValue(value, type) {
  if (value == null) return "";

  if (type === "datetime-local") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    }
  }

  if (type === "time") {
    return String(value).slice(0, 5);
  }

  return String(value);
}

function coerceValueByField(nextValue, field, sampleValue) {
  if (typeof field.parse === "function") {
    return field.parse(nextValue, sampleValue);
  }

  if (field.type === "number") {
    const parsed = Number(nextValue);
    return Number.isFinite(parsed) ? parsed : sampleValue;
  }

  if (field.type === "datetime-local") {
    const date = new Date(nextValue);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  if (field.type === "boolean") {
    return ["true", "1", "yes", "y"].includes(String(nextValue).toLowerCase());
  }

  return nextValue;
}

export default function EntityTableCard({
  title,
  description,
  endpoint,
  actionEndpoint,
  columns,
  editFields,
  refreshKey = 0,
  emptyMessage = "Belum ada data.",
  showActions = true,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const targetActionEndpoint = actionEndpoint || endpoint;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getJson(endpoint);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRows(list);
    } catch (err) {
      setError(err?.message || "Gagal memuat data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleDelete = async (row) => {
    const rowId = row?.id ?? row?._id;
    if (rowId == null) {
      setError("Data tidak memiliki ID, tidak bisa dihapus.");
      return;
    }

    const ok = window.confirm(`Yakin ingin menghapus data ID ${rowId}?`);
    if (!ok) return;

    setActionLoadingId(`delete-${rowId}`);
    setError("");
    try {
      await deleteJson(`${targetActionEndpoint}/${rowId}`);
      await loadData();
    } catch (err) {
      setError(err?.message || "Gagal menghapus data");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleEdit = async (row) => {
    const rowId = row?.id ?? row?._id;
    if (rowId == null) {
      setError("Data tidak memiliki ID, tidak bisa diedit.");
      return;
    }

    const editableFields = (editFields || columns)
      .filter((field) => field.key && field.key !== "id" && field.key !== "_id" && !field.readOnly)
      .map((field) => ({
        ...field,
        type: field.type || "text",
      }));

    const nextValues = {};
    editableFields.forEach((field) => {
      const sampleValue = readPath(row, field.key);
      nextValues[field.key] = formatEditValue(sampleValue, field.type);
    });

    setEditValues(nextValues);
    setEditingRow(row);
    setEditError("");
  };

  const closeEditModal = () => {
    if (editSaving) return;
    setEditingRow(null);
    setEditValues({});
    setEditError("");
  };

  const handleEditChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const rowId = editingRow?.id ?? editingRow?._id;
    if (rowId == null) {
      setEditError("Data tidak memiliki ID, tidak bisa diedit.");
      return;
    }

    const editableFields = (editFields || columns)
      .filter((field) => field.key && field.key !== "id" && field.key !== "_id" && !field.readOnly)
      .map((field) => ({
        ...field,
        type: field.type || "text",
      }));

    const payload = {};
    for (const field of editableFields) {
      const sampleValue = readPath(editingRow, field.key);
      payload[field.key] = coerceValueByField(editValues[field.key] ?? "", field, sampleValue);
    }

    setEditSaving(true);
    setActionLoadingId(`edit-${rowId}`);
    setEditError("");
    setError("");

    try {
      await putJson(`${targetActionEndpoint}/${rowId}`, payload);
      await loadData();
      closeEditModal();
    } catch (err) {
      setEditError(err?.message || "Gagal mengubah data");
    } finally {
      setEditSaving(false);
      setActionLoadingId("");
    }
  };

  const modalFields = (editFields || columns)
    .filter((field) => field.key && field.key !== "id" && field.key !== "_id" && !field.readOnly)
    .map((col) => ({
      key: col.key,
      label: col.label,
      hint: col.hint,
      placeholder: col.placeholder,
      type: col.type,
      options: col.options,
      rows: col.rows,
      step: col.step,
      min: col.min,
      max: col.max,
    }));

  return (
    <SectionCard
      title={title}
      description={description || `GET /api${endpoint} - Total data: ${rows.length}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Menampilkan data terbaru dari API.</p>
        <button
          type="button"
          onClick={loadData}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          disabled={loading}
        >
          {loading ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <EntityEditModal
        open={Boolean(editingRow)}
        title={`Edit ${title}`}
        description="Ubah field yang diperlukan saja, lalu simpan perubahan."
        fields={modalFields}
        values={editValues}
        onChange={handleEditChange}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        loading={editSaving}
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700"
                >
                  {col.label}
                </th>
              ))}
              {showActions ? (
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {!loading && !rows.length ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : null}

            {rows.map((row, index) => (
              <tr key={String(row?.id ?? row?._id ?? index)} className="align-top">
                {columns.map((col) => {
                  const rawValue = col.render ? col.render(row, index) : readPath(row, col.key);
                  return (
                    <td key={col.key || col.label} className="px-4 py-3 text-slate-700">
                      {formatCellValue(rawValue)}
                    </td>
                  );
                })}

                {showActions ? (
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(row)}
                        disabled={Boolean(actionLoadingId)}
                        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        disabled={Boolean(actionLoadingId)}
                        className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
