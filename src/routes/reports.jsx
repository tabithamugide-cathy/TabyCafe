import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/reports")({
  validateSearch: (search) => ({
    type: TYPES.includes(search.type) ? search.type : "Sales",
  }),
  component: RouteComponent,
});

const TYPES = ["Sales", "Products", "Inventory", "Staff"];
const RANGES = ["Today", "This Week", "This Month", "This Year", "Custom"];

// Swap for data fetched via useQuery once your API is wired up
const SALES_SUMMARY = {
  revenue: 68450000,
  revenueChange: 12.4,
  orders: 842,
  ordersChange: 8.1,
  avgOrderValue: 81300,
  avgOrderChange: -2.3,
  refunds: 3,
};

const TOP_SELLING = [
  { name: "Chicken Burger", sold: 245, revenue: 3675000 },
  { name: "Margherita Pizza", sold: 198, revenue: 5544000 },
  { name: "Grilled Tilapia", sold: 176, revenue: 5632000 },
  { name: "Rolex", sold: 160, revenue: 960000 },
  { name: "Passion Juice", sold: 140, revenue: 700000 },
];

const CATEGORY_SALES = [
  { category: "Local foods", pct: 42 },
  { category: "Fast foods", pct: 35 },
  { category: "Cold drinks", pct: 23 },
];

const STOCK_USAGE = [
  { name: "Chicken", used: "68 kg", cost: 1360000 },
  { name: "Cooking Oil", used: "22 L", cost: 330000 },
  { name: "Tomatoes", used: "40 kg", cost: 200000 },
  { name: "Rice", used: "85 kg", cost: 680000 },
];

const STAFF_PERFORMANCE = [
  { name: "Faith Auma", role: "Barista", ordersHandled: 210, rating: 4.8 },
  { name: "Peter Wanyama", role: "Waiter", ordersHandled: 185, rating: 4.6 },
  { name: "Diana Lamunu", role: "Chef", ordersHandled: 240, rating: 4.9 },
  { name: "Kevin Mugisha", role: "Cashier", ordersHandled: 160, rating: 4.4 },
];

function formatUGX(amount) {
  return `UGX ${amount.toLocaleString()}`;
}

function ChangeBadge({ value }) {
  const isUp = value >= 0;
  return (
    <span className={`text-sm ${isUp ? "text-green-600" : "text-red-500"}`}>
      {isUp ? "↑" : "↓"} {Math.abs(value)}% vs previous period
    </span>
  );
}

function RouteComponent() {
  const { type } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [activeType, setActiveType] = useState(type);
  const [range, setRange] = useState("This Month");

  const selectType = (t) => {
    setActiveType(t);
    navigate({ search: { type: t } });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
          <p className="mt-1 text-slate-500">
            Performance across sales, menu, inventory, and staff.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="select select-sm border-slate-300 focus:border-cafe-500 focus:outline-none"
          >
            {RANGES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          <button className="btn btn-sm bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600">
            Export
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => {
          const isActive = activeType === t;
          return (
            <button
              key={t}
              onClick={() => selectType(t)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-cafe-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-cafe-50 hover:text-cafe-700"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {activeType === "Sales" && <SalesReport range={range} />}
      {activeType === "Products" && <ProductsReport />}
      {activeType === "Inventory" && <InventoryReport />}
      {activeType === "Staff" && <StaffReport />}
    </div>
  );
}

function SalesReport({ range }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Revenue ({range})</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {formatUGX(SALES_SUMMARY.revenue)}
          </h2>
          <div className="mt-3">
            <ChangeBadge value={SALES_SUMMARY.revenueChange} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Orders</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {SALES_SUMMARY.orders}
          </h2>
          <div className="mt-3">
            <ChangeBadge value={SALES_SUMMARY.ordersChange} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Avg. Order Value</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {formatUGX(SALES_SUMMARY.avgOrderValue)}
          </h2>
          <div className="mt-3">
            <ChangeBadge value={SALES_SUMMARY.avgOrderChange} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Refunds Issued</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {SALES_SUMMARY.refunds}
          </h2>
          <p className="mt-3 text-sm text-slate-400">Across all methods</p>
        </div>
      </div>

      {/* Revenue trend + category split */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800">
            Revenue Trend
          </h2>
          <p className="text-sm text-slate-500">
            Daily revenue for the selected period
          </p>

          <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-cafe-50">
            <div className="text-center">
              <div className="text-5xl">📈</div>
              <p className="mt-3 text-slate-500">
                Revenue chart will appear here
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Sales by Category
          </h2>
          <div className="mt-5 space-y-4">
            {CATEGORY_SALES.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{c.category}</span>
                  <span className="text-slate-500">{c.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-cafe-500"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsReport() {
  const maxRevenue = Math.max(...TOP_SELLING.map((p) => p.revenue));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">
        Top Selling Products
      </h2>
      <p className="text-sm text-slate-500">Ranked by units sold this period</p>

      <div className="mt-5 space-y-4">
        {TOP_SELLING.map((p, i) => (
          <div key={p.name} className="flex items-center gap-4">
            <span className="w-5 text-sm font-semibold text-slate-400">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800">{p.name}</span>
                <span className="text-slate-500">
                  {p.sold} sold · {formatUGX(p.revenue)}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-cafe-500"
                  style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryReport() {
  const totalCost = STOCK_USAGE.reduce((sum, s) => sum + s.cost, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Total Ingredient Cost</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-800">
          {formatUGX(totalCost)}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Based on usage this period
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th>Ingredient</th>
                <th>Quantity Used</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {STOCK_USAGE.map((item) => (
                <tr key={item.name} className="hover:bg-cafe-50/50">
                  <td className="font-medium text-slate-800">{item.name}</td>
                  <td className="text-slate-600">{item.used}</td>
                  <td className="text-slate-800">{formatUGX(item.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StaffReport() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th>Staff Member</th>
              <th>Role</th>
              <th>Orders Handled</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {STAFF_PERFORMANCE.map((s) => (
              <tr key={s.name} className="hover:bg-cafe-50/50">
                <td className="font-medium text-slate-800">{s.name}</td>
                <td className="text-slate-600">{s.role}</td>
                <td className="text-slate-600">{s.ordersHandled}</td>
                <td className="text-slate-800">⭐ {s.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
