import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8080/api";

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
  OPEN: "badge-neutral",
  IN_PROGRESS: "badge-warning",
  SERVED: "badge-success",
  PAID: "badge-info",
  CANCELLED: "badge-error",
};

function formatUGX(amount) {
  return `UGX ${Math.round(amount).toLocaleString()}`;
}

function countByStatus(orders, status) {
  return status === "All"
    ? orders.length
    : orders.filter((o) => o.status === status).length;
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
    fetch(`${API_BASE}/orders/all`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        return res.json();
      })
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

  const runAction = async (orderId, endpoint, method = "POST") => {
    setActionLoadingId(orderId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/${endpoint}`, {
        method,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Could not ${endpoint} order`);
      }
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
          onClick={() => runAction(order.id, "confirm")}
          disabled={isLoading}
          className="btn btn-ghost btn-xs text-cafe-600 hover:text-cafe-700 disabled:opacity-50"
        >
          {isLoading ? "..." : "Confirm"}
        </button>
      );
    }
    if (order.status === "IN_PROGRESS") {
      return (
        <button
          onClick={() => runAction(order.id, "serve")}
          disabled={isLoading}
          className="btn btn-ghost btn-xs text-cafe-600 hover:text-cafe-700 disabled:opacity-50"
        >
          {isLoading ? "..." : "Mark Served"}
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

  if (loading) {
    return <p className="text-slate-500">Loading orders...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Orders</h1>
        <p className="mt-1 text-slate-500">
          Track every order from OPEN to PAID.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
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
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-cafe-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-cafe-50 hover:text-cafe-700"
              }`}
            >
              {STATUS_LABELS[tab] || tab}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  isActive ? "bg-white/25" : "bg-slate-100 text-slate-500"
                }`}
              >
                {countByStatus(orders, tab)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, staff, table..."
              className="input input-sm w-full border-slate-300 pl-3 focus:border-cafe-500 focus:outline-none"
            />
          </div>
          <p className="hidden text-sm text-slate-500 sm:block">
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th>Order</th>
                <th>Staff</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-cafe-50/50">
                  <td className="font-medium text-slate-800">#{order.id}</td>
                  <td className="text-slate-600">{order.staffName}</td>
                  <td className="text-slate-600">Table {order.tableNumber}</td>
                  <td className="text-slate-600">{order.items.length}</td>
                  <td className="text-slate-800">{formatUGX(order.total)}</td>
                  <td>
                    <span
                      className={`badge ${STATUS_STYLES[order.status]} badge-sm`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td>
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
    </div>
  );
}
