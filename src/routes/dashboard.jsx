import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BsExclamationTriangle,
  BsGrid3X3Gap,
  BsHourglassSplit,
  BsReceipt,
} from "react-icons/bs";
import { PiForkKnifeFill } from "react-icons/pi";
import { fetchJson } from "../api";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function formatUGX(amount) {
  return `UGX ${Math.round(Number(amount ?? 0)).toLocaleString()}`;
}

const STATUS_META = {
  OPEN: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200" },
  IN_PROGRESS: { label: "Preparing", className: "bg-cafe-50 text-cafe-700 ring-1 ring-inset ring-cafe-200" },
  SERVED: { label: "Ready", className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200" },
  PAID: { label: "Paid", className: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200" },
};

function statusMeta(status) {
  return STATUS_META[status] ?? { label: status, className: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200" };
}

const STAT_DEFS = [
  { key: "totalOrders", label: "Total orders", Icon: BsReceipt, format: (v) => v ?? 0 },
  { key: "pendingOrders", label: "Pending orders", Icon: BsHourglassSplit, format: (v) => v ?? 0 },
  { key: "menuItems", label: "Menu items", Icon: PiForkKnifeFill, format: (v) => v ?? 0 },
  { key: "availableTables", label: "Available tables", Icon: BsGrid3X3Gap, format: (v) => v ?? 0 },
];

function StatCard({ label, value, Icon }) {
  return (
    <div className="rounded-2xl border border-[#eadfd5] bg-[#fffdfb] p-5 shadow-[0_8px_30px_rgba(83,48,24,0.05)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(83,48,24,0.1)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#2b211c]">
            {value}
          </h2>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cafe-100 text-cafe-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-5 sm:p-8 lg:p-10 animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-40 rounded bg-cafe-100" />
        <div className="h-8 w-56 rounded bg-cafe-100" />
        <div className="h-4 w-72 rounded bg-cafe-100" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-[#eadfd5] bg-[#fffdfb] p-5"
          >
            <div className="h-3 w-20 rounded bg-cafe-100" />
            <div className="mt-3 h-6 w-14 rounded bg-cafe-100" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-96 rounded-2xl border border-[#eadfd5] bg-[#fffdfb] xl:col-span-2" />
        <div className="h-96 rounded-2xl border border-[#eadfd5] bg-[#fffdfb]" />
      </div>
    </div>
  );
}

function DashboardError({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 m-6 sm:m-10 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
      <BsExclamationTriangle className="h-8 w-8 text-red-500" />
      <p className="font-semibold text-red-700">Couldn't load the dashboard</p>
      <p className="text-sm text-red-600">{message}</p>
    </div>
  );
}

function RouteComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => fetchJson("/dashboard/summary"),
    refetchInterval: 30000,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError message={error.message} />;

  return (
    <div className="space-y-8 p-5 sm:p-8 lg:p-10">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cafe-700">
          Operations overview
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2b211c]">Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Welcome back! Here's what's happening in your restaurant.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_DEFS.map(({ key, label, Icon, format }) => (
          <StatCard key={key} label={label} Icon={Icon} value={format(data[key])} />
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sales Overview */}
        <div className="rounded-2xl border border-[#eadfd5] bg-[#fffdfb] p-6 shadow-[0_8px_30px_rgba(83,48,24,0.05)] xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#2b211c]">Sales Overview</h2>
              <p className="text-sm text-slate-500">Restaurant sales performance</p>
            </div>

            <select className="select select-sm border-slate-300 focus:border-cafe-500 focus:outline-none">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          {/* Temporary chart area */}
          <div className="mt-6 flex h-72 items-end gap-3 rounded-xl border border-cafe-100 bg-gradient-to-b from-cafe-50 to-[#fffdfb] px-5 pb-5 pt-8">
            {[42, 58, 48, 72, 64, 86, 76, 94, 82, 100].map((height, index) => (
              <div key={index} className="flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-cafe-400 transition-all duration-300 hover:bg-cafe-600"
                  style={{ height: `${height}%` }}
                  title={`Day ${index + 1}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs text-slate-400">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-[#eadfd5] bg-[#fffdfb] p-6 shadow-[0_8px_30px_rgba(83,48,24,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2b211c]">Top Products</h2>
            <button className="text-sm font-medium text-cafe-600 transition-colors duration-150 hover:text-cafe-700">
              View all
            </button>
          </div>

          {data.topProducts?.length ? (
            <div className="mt-5 space-y-5">
              {data.topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cafe-50 text-cafe-700">
                      <PiForkKnifeFill className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.quantity} sold</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    {formatUGX(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-400">No sales data yet.</p>
          )}
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-[#eadfd5] bg-[#fffdfb] p-6 shadow-[0_8px_30px_rgba(83,48,24,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2b211c]">Recent Orders</h2>
            <button className="text-sm font-medium text-cafe-600 transition-colors duration-150 hover:text-cafe-700">
              View all
            </button>
          </div>

          {data.recentOrders?.length ? (
            <div className="mt-5 space-y-4">
              {data.recentOrders.map((order, i) => {
                const status = statusMeta(order.status);
                return (
                  <div
                    key={order.id}
                    className={`flex items-center justify-between ${
                      i < data.recentOrders.length - 1 ? "border-b border-cafe-100 pb-4" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-800">Order #{order.id}</p>
                      <p className="text-sm text-slate-500">
                        Table {order.tableNumber} · {order.staffName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{formatUGX(order.total)}</p>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-400">No recent orders.</p>
          )}
        </div>

        {/* Low Stock */}
        <div className="rounded-2xl border border-[#eadfd5] bg-[#fffdfb] p-6 shadow-[0_8px_30px_rgba(83,48,24,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2b211c]">Low Stock Items</h2>
            <button className="text-sm font-medium text-cafe-600 transition-colors duration-150 hover:text-cafe-700">
              View all
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <p className="text-sm text-slate-500">
              Inventory alerts will appear here when ingredient stock endpoints are connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}