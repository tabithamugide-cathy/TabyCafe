import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/stock")({
  validateSearch: (search) => ({
    tab: TABS_INCLUDES(search.tab) ? search.tab : "Stock",
  }),
  component: RouteComponent,
});

const TABS = ["Stock", "Low Stock", "Stock In", "History"];

function TABS_INCLUDES(value) {
  return TABS.includes(value);
}

// Swap for data fetched via useQuery once your API is wired up
const INITIAL_STOCK = [
  {
    id: 1,
    name: "Chicken",
    unit: "kg",
    quantity: 8,
    reorderLevel: 10,
    icon: "🍗",
  },
  {
    id: 2,
    name: "Cooking Oil",
    unit: "L",
    quantity: 2,
    reorderLevel: 5,
    icon: "🫗",
  },
  {
    id: 3,
    name: "Tomatoes",
    unit: "kg",
    quantity: 0,
    reorderLevel: 5,
    icon: "🍅",
  },
  {
    id: 4,
    name: "Cheese",
    unit: "kg",
    quantity: 5,
    reorderLevel: 8,
    icon: "🧀",
  },
  {
    id: 5,
    name: "Rice",
    unit: "kg",
    quantity: 40,
    reorderLevel: 15,
    icon: "🍚",
  },
  {
    id: 6,
    name: "Matooke",
    unit: "bunches",
    quantity: 22,
    reorderLevel: 10,
    icon: "🍌",
  },
  {
    id: 7,
    name: "Soda Crates",
    unit: "crates",
    quantity: 18,
    reorderLevel: 6,
    icon: "🥤",
  },
  {
    id: 8,
    name: "Flour",
    unit: "kg",
    quantity: 3,
    reorderLevel: 10,
    icon: "🌾",
  },
];

const INITIAL_HISTORY = [
  {
    id: 1,
    item: "Chicken",
    change: "+20 kg",
    type: "Stock in",
    by: "Tabitha M.",
    date: "Aug 29, 2026 · 9:12 AM",
  },
  {
    id: 2,
    item: "Cooking Oil",
    change: "-3 L",
    type: "Used in orders",
    by: "System",
    date: "Aug 29, 2026 · 11:40 AM",
  },
  {
    id: 3,
    item: "Tomatoes",
    change: "-5 kg",
    type: "Used in orders",
    by: "System",
    date: "Aug 30, 2026 · 1:05 PM",
  },
  {
    id: 4,
    item: "Rice",
    change: "+25 kg",
    type: "Stock in",
    by: "Brian T.",
    date: "Aug 30, 2026 · 3:30 PM",
  },
  {
    id: 5,
    item: "Flour",
    change: "-7 kg",
    type: "Used in orders",
    by: "System",
    date: "Aug 31, 2026 · 8:15 AM",
  },
];

function getStatus(item) {
  if (item.quantity === 0) return { label: "Out", badge: "badge-error" };
  if (item.quantity <= item.reorderLevel)
    return { label: "Low", badge: "badge-warning" };
  return { label: "Good", badge: "badge-success" };
}

// Swap for your real endpoint
async function recordStockIn(payload) {
  const res = await fetch("/api/stock/stock-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok)
    throw new Error("Couldn't record the stock-in. Please try again.");
  return res.json();
}

function RouteComponent() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [activeTab, setActiveTab] = useState(tab);
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [search, setSearch] = useState("");

  useEffect(() => setActiveTab(tab), [tab]);

  const selectTab = (t) => {
    setActiveTab(t);
    navigate({ search: { tab: t } });
  };

  const filteredStock = useMemo(() => {
    const base =
      activeTab === "Low Stock"
        ? stock.filter((i) => getStatus(i).label !== "Good")
        : stock;
    return base.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [stock, activeTab, search]);

  const lowStockCount = stock.filter(
    (i) => getStatus(i).label !== "Good",
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Inventory</h1>
        <p className="mt-1 text-slate-500">
          Track ingredient stock, restocks, and usage history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Items</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {stock.length}
          </h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Needs Attention</p>
          <h2 className="mt-2 text-2xl font-bold text-amber-600">
            {lowStockCount}
          </h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Stock Movements Today</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {history.filter((h) => h.date.startsWith("Aug 31")).length}
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => selectTab(t)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-cafe-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-cafe-50 hover:text-cafe-700"
              }`}
            >
              {t}
              {t === "Low Stock" && lowStockCount > 0 && (
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    isActive ? "bg-white/25" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {lowStockCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {(activeTab === "Stock" || activeTab === "Low Stock") && (
        <StockTable
          items={filteredStock}
          search={search}
          onSearch={setSearch}
          showEmptyLowStockNote={activeTab === "Low Stock"}
        />
      )}

      {activeTab === "Stock In" && (
        <StockInForm
          stock={stock}
          onRecord={({ itemId, quantity, note }) => {
            const item = stock.find((s) => s.id === Number(itemId));
            if (!item) return;

            setStock((prev) =>
              prev.map((s) =>
                s.id === item.id
                  ? { ...s, quantity: s.quantity + Number(quantity) }
                  : s,
              ),
            );
            setHistory((prev) => [
              {
                id: Date.now(),
                item: item.name,
                change: `+${quantity} ${item.unit}`,
                type: "Stock in",
                by: "You",
                date: "Just now",
              },
              ...prev,
            ]);

            recordStockIn({ itemId: item.id, quantity, note }).catch(() => {
              // Backend call failed silently for now — surface this once wired up
            });
          }}
        />
      )}

      {activeTab === "History" && <HistoryTable history={history} />}
    </div>
  );
}

function StockTable({ items, search, onSearch, showEmptyLowStockNote }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="relative w-full max-w-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search ingredients..."
            className="input input-sm w-full border-slate-300 pl-9 focus:border-cafe-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th>Ingredient</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = getStatus(item);
              return (
                <tr key={item.id} className="hover:bg-cafe-50/50">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cafe-50 text-xl">
                        {item.icon}
                      </div>
                      <span className="font-medium text-slate-800">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-slate-600">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="text-slate-500">
                    {item.reorderLevel} {item.unit}
                  </td>
                  <td>
                    <span className={`badge ${status.badge} badge-sm`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-400">
                  {showEmptyLowStockNote
                    ? "Nothing running low right now — nice work."
                    : "No ingredients match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockInForm({ stock, onRecord }) {
  const [itemId, setItemId] = useState(stock[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const mutation = useMutation({
    mutationFn: async (payload) => {
      onRecord(payload);
      return payload;
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemId) {
      setError("Choose an ingredient.");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    setError("");

    const item = stock.find((s) => s.id === Number(itemId));
    mutation.mutate({ itemId, quantity, note });
    setConfirmation(
      `Added ${quantity} ${item?.unit ?? ""} of ${item?.name ?? "item"} to stock.`,
    );
    setQuantity("");
    setNote("");
  };

  return (
    <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Record Stock In</h2>
      <p className="mt-1 text-sm text-slate-500">
        Log a delivery or restock — this updates quantities immediately.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="form-control w-full">
          <label className="label" htmlFor="item">
            <span className="label-text text-slate-600">Ingredient</span>
          </label>
          <select
            id="item"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="select w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
          >
            {stock.map((item) => (
              <option key={item.id} value={item.id}>
                {item.icon} {item.name} — currently {item.quantity} {item.unit}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label" htmlFor="quantity">
            <span className="label-text text-slate-600">Quantity received</span>
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 20"
            className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
          />
        </div>

        <div className="form-control w-full">
          <label className="label" htmlFor="note">
            <span className="label-text text-slate-600">Note (optional)</span>
          </label>
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Supplier: Fresh Farms Ltd"
            className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {confirmation && !error && (
          <p className="text-sm text-green-600">{confirmation}</p>
        )}

        <button
          type="submit"
          className="btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600 w-full sm:w-auto"
        >
          Add to Stock
        </button>
      </form>
    </div>
  );
}

function HistoryTable({ history }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th>Ingredient</th>
              <th>Change</th>
              <th>Type</th>
              <th>By</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id} className="hover:bg-cafe-50/50">
                <td className="font-medium text-slate-800">{entry.item}</td>
                <td
                  className={
                    entry.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {entry.change}
                </td>
                <td className="text-slate-600">{entry.type}</td>
                <td className="text-slate-600">{entry.by}</td>
                <td className="text-slate-500">{entry.date}</td>
              </tr>
            ))}

            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">
                  No stock movements recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
