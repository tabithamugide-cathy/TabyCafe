import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import { BsExclamationTriangle, BsSearch } from "react-icons/bs";
import { fetchJson } from "../api";

export const Route = createFileRoute("/orders")({
  validateSearch: (search) => ({
    status: TABS_INCLUDES(search.status) ? search.status : "All",
  }),
  component: RouteComponent,
});

function TABS_INCLUDES(value) {
  return ["All", "OPEN", "IN_PROGRESS", "SERVED", "PAID", "CANCELLED"].includes(
    value,
  );
}

const TABS = ["All", "OPEN", "IN_PROGRESS", "SERVED", "PAID", "CANCELLED"];

const STATUS_LABELS = {
  OPEN: "Pending",
  IN_PROGRESS: "Preparing",
  SERVED: "Ready",
  PAID: "Finished",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES = {
  OPEN: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  IN_PROGRESS: "bg-cafe-50 text-cafe-700 ring-1 ring-inset ring-cafe-200",
  SERVED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  PAID: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200",
};

function formatUGX(amount) {
  return `UGX ${Math.round(amount).toLocaleString()}`;
}

function countByStatus(orders, status) {
  return status === "All"
    ? orders.length
    : orders.filter((o) => o.status === status).length;
}

function OrdersTableSkeleton() {
  return (
    <div className="rounded-2xl border border-[#eadfd5] bg-[#fffdfb] shadow-[0_8px_30px_rgba(83,48,24,0.05)] animate-pulse">
      <div className="border-b border-cafe-100 p-4">
        <div className="h-9 w-full max-w-xs rounded-lg bg-cafe-100" />
      </div>
      <div className="divide-y divide-cafe-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-4 py-4">
            <div className="h-4 w-10 rounded bg-cafe-100" />
            <div className="h-4 w-24 rounded bg-cafe-100" />
            <div className="h-4 w-16 rounded bg-cafe-100" />
            <div className="h-4 w-10 rounded bg-cafe-100" />
            <div className="h-4 w-20 rounded bg-cafe-100" />
            <div className="ml-auto h-6 w-20 rounded-full bg-cafe-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteComponent() {
  const { status } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [activeTab, setActiveTab] = useState(status);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    fetchJson("/orders/all")
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]); // runs once on mount

  useEffect(() => {
    setActiveTab(status);
  }, [status]);

  const selectTab = (tab) => {
    setActiveTab(tab);
    navigate({ search: { status: tab } });
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = activeTab === "All" || o.status === activeTab;
      const matchesSearch =
        String(o.id).includes(search) ||
        o.staffName.toLowerCase().includes(search.toLowerCase()) ||
        String(o.tableNumber).includes(search);
      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, search]);

  const runAction = async (orderId, newStatus) => {
    setActionLoadingId(orderId);
    setError(null);
    try {
      await fetchJson(`/orders/${orderId}/status?newStatus=${newStatus}`, {
        method: "PATCH",
      });
      loadOrders(); // refresh the list to reflect the new status
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderActions = (order) => {
    const isLoading = actionLoadingId === order.id;

    if (order.status === "OPEN") {
      return (
        <button
          onClick={() => runAction(order.id, "IN_PROGRESS")}
          disabled={isLoading}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-cafe-600 transition-colors duration-150 hover:bg-cafe-50 hover:text-cafe-700 disabled:opacity-50"
        >
          {isLoading ? "..." : "Start preparing"}
        </button>
      );
    }
    if (order.status === "IN_PROGRESS") {
      return (
        <button
          onClick={() => runAction(order.id, "SERVED")}
          disabled={isLoading}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-cafe-600 transition-colors duration-150 hover:bg-cafe-50 hover:text-cafe-700 disabled:opacity-50"
        >
          {isLoading ? "..." : "Mark ready"}
        </button>
      );
    }
    if (order.status === "SERVED") {
      return (
        <span className="text-xs text-slate-400 italic">Awaiting payment</span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#2b211c]">Orders</h1>
        <p className="mt-1 text-slate-500">
          Track every order from OPEN to PAID.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <BsExclamationTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => selectTab(tab)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-cafe-500 text-white shadow-sm"
                  : "border border-[#eadfd5] bg-[#fffdfb] text-slate-600 hover:bg-cafe-50 hover:text-cafe-700"
              }`}
            >
              {STATUS_LABELS[tab] || tab}
              <span
                className={`rounded-full px-1.5 text-xs transition-colors duration-200 ${
                  isActive ? "bg-white/25" : "bg-cafe-50 text-slate-500"
                }`}
              >
                {countByStatus(orders, tab)}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <OrdersTableSkeleton />
      ) : (
        <div className="rounded-2xl border border-[#eadfd5] bg-[#fffdfb] shadow-[0_8px_30px_rgba(83,48,24,0.05)]">
          <div className="flex items-center justify-between gap-4 border-b border-cafe-100 p-4">
            <div className="relative w-full max-w-xs">
              <BsSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order, staff, table..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm transition-colors duration-150 focus:border-cafe-500 focus:outline-none focus:ring-1 focus:ring-cafe-500"
              />
            </div>
            <p className="hidden shrink-0 text-sm text-slate-500 sm:block">
              {filtered.length} order{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Staff</th>
                  <th className="px-4 py-3 font-semibold">Table</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cafe-100">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors duration-150 hover:bg-cafe-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.staffName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      Table {order.tableNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.items.length}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {formatUGX(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {renderActions(order)}
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No orders match this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}