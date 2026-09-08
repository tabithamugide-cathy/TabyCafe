import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { API_BASE, fetchJson } from "../api";

export const Route = createFileRoute("/tables")({
  component: RouteComponent,
});

const STATUSES = ["FREE", "OCCUPIED", "RESERVED"];

const STATUS_LABELS = {
  FREE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
};

const STATUS_STYLES = {
  FREE: { badge: "badge-success", ring: "ring-green-200", bg: "bg-green-50" },
  OCCUPIED: { badge: "badge-error", ring: "ring-red-200", bg: "bg-red-50" },
  RESERVED: {
    badge: "badge-warning",
    ring: "ring-amber-200",
    bg: "bg-amber-50",
  },
};

const initialForm = { tableNumber: "", capacity: 2 };

async function fetchTables() {
  return fetchJson("/tables");
}

async function updateTableStatus({ id, status }) {
  return fetchJson(`/tables/${id}/status?status=${status}`, { method: "PATCH" });
}

async function createTable(payload) {
  return fetchJson("/tables", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function RouteComponent() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTable, setActiveTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const loadTables = useCallback(() => {
    setLoading(true);
    fetchTables()
      .then((data) => {
        setTables(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]); // fetch once on mount

  const statusMutation = useMutation({
    mutationFn: updateTableStatus,
    onSuccess: () => loadTables(),
    onError: (err) => setError(err.message),
  });

  const createMutation = useMutation({
    mutationFn: createTable,
    onSuccess: () => {
      loadTables();
      setForm(initialForm);
      setShowAddModal(false);
    },
    onError: (err) => setError(err.message),
  });

  const setStatus = (table, status) => {
    statusMutation.mutate({ id: table.id, status });
    setActiveTable(null);
  };

  const filtered = useMemo(() => {
    return statusFilter === "All"
      ? tables
      : tables.filter((t) => t.status === statusFilter);
  }, [tables, statusFilter]);

  const counts = useMemo(() => {
    const base = { FREE: 0, OCCUPIED: 0, RESERVED: 0 };
    tables.forEach((t) => (base[t.status] = (base[t.status] ?? 0) + 1));
    return base;
  }, [tables]);

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!form.tableNumber) {
      setError("Table number is required.");
      return;
    }
    setError("");
    createMutation.mutate({
      tableNumber: Number(form.tableNumber),
      capacity: Number(form.capacity),
    });
  };

  if (loading) {
    return <p className="text-slate-500">Loading tables...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tables</h1>
          <p className="mt-1 text-slate-500">
            See what's free, occupied, or reserved.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600"
        >
          + Add Table
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("All")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === "All"
              ? "bg-cafe-500 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-cafe-50 hover:text-cafe-700"
          }`}
        >
          All
          <span
            className={`rounded-full px-1.5 text-xs ${statusFilter === "All" ? "bg-white/25" : "bg-slate-100 text-slate-500"}`}
          >
            {tables.length}
          </span>
        </button>

        {STATUSES.map((status) => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-cafe-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-cafe-50 hover:text-cafe-700"
              }`}
            >
              {STATUS_LABELS[status]}
              <span
                className={`rounded-full px-1.5 text-xs ${isActive ? "bg-white/25" : "bg-slate-100 text-slate-500"}`}
              >
                {counts[status] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((table) => {
          const style = STATUS_STYLES[table.status];
          return (
            <button
              key={table.id}
              onClick={() => setActiveTable(table)}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border ${style.ring} ${style.bg} p-5 text-center shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md`}
            >
              <span className="text-3xl">🪑</span>
              <p className="font-semibold text-slate-800">
                Table {table.tableNumber}
              </p>
              <p className="text-xs text-slate-500">{table.capacity} seats</p>
              <span className={`badge ${style.badge} badge-sm`}>
                {STATUS_LABELS[table.status]}
              </span>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
            No tables in this state right now.
          </div>
        )}
      </div>

      {activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Table {activeTable.tableNumber}
              </h2>
              <button
                onClick={() => setActiveTable(null)}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {activeTable.capacity} seats
            </p>

            <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-400">
              Change status
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatus(activeTable, status)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    activeTable.status === status
                      ? "border-cafe-500 bg-cafe-50 text-cafe-700"
                      : "border-slate-200 text-slate-600 hover:border-cafe-300 hover:bg-cafe-50"
                  }`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Add Table
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTable} className="mt-4 space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="t-number">
                  <span className="label-text text-slate-600">
                    Table number
                  </span>
                </label>
                <input
                  id="t-number"
                  type="number"
                  min="1"
                  value={form.tableNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tableNumber: e.target.value }))
                  }
                  placeholder="e.g. 13"
                  className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="t-seats">
                  <span className="label-text text-slate-600">Seats</span>
                </label>
                <input
                  id="t-seats"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capacity: e.target.value }))
                  }
                  className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600 disabled:opacity-60"
                >
                  {createMutation.isPending ? "Saving..." : "Add Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
