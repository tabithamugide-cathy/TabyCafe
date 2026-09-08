import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

const STATS = [
  {
    label: "Today's Sales",
    value: "UGX 2,450,000",
    change: "↑ 18.5% vs yesterday",
    trend: "up",
    icon: "💰",
  },
  {
    label: "Orders",
    value: "124",
    change: "↑ 12.3% vs yesterday",
    trend: "up",
    icon: "🛍️",
  },
  {
    label: "Pending Orders",
    value: "18",
    change: "↓ 5.2% vs yesterday",
    trend: "down",
    icon: "⏳",
  },
  {
    label: "Customers",
    value: "87",
    change: "↑ 8.7% vs yesterday",
    trend: "up",
    icon: "👥",
  },
];

const TOP_PRODUCTS = [
  { name: "Chicken Burger", sold: "245 sold", revenue: "UGX 3.6M", icon: "🍔" },
  {
    name: "Margherita Pizza",
    sold: "198 sold",
    revenue: "UGX 2.9M",
    icon: "🍕",
  },
  { name: "French Fries", sold: "176 sold", revenue: "UGX 1.4M", icon: "🍟" },
  { name: "Coca Cola", sold: "160 sold", revenue: "UGX 640K", icon: "🥤" },
];

const RECENT_ORDERS = [
  {
    id: "#1045",
    customer: "John Doe · 3 items",
    amount: "UGX 45,000",
    status: "Preparing",
    badge: "badge-warning",
  },
  {
    id: "#1044",
    customer: "Sarah · 2 items",
    amount: "UGX 32,000",
    status: "Ready",
    badge: "badge-success",
  },
  {
    id: "#1043",
    customer: "Michael · 5 items",
    amount: "UGX 78,000",
    status: "Delivered",
    badge: "badge-info",
  },
];

const LOW_STOCK = [
  {
    name: "Chicken",
    remaining: "8 kg remaining",
    icon: "🍗",
    status: "Good",
    badge: "badge-success",
  },
  {
    name: "Cooking Oil",
    remaining: "2 L remaining",
    icon: "🫗",
    status: "Low",
    badge: "badge-warning",
  },
  {
    name: "Tomatoes",
    remaining: "0 kg remaining",
    icon: "🍅",
    status: "Out",
    badge: "badge-error",
  },
  {
    name: "Cheese",
    remaining: "5 kg remaining",
    icon: "🧀",
    status: "Low",
    badge: "badge-warning",
  },
];

function RouteComponent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-1 text-slate-500">
          Welcome back! Here's what's happening in your restaurant.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-800">
                  {stat.value}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cafe-100 text-2xl">
                {stat.icon}
              </div>
            </div>

            <p
              className={`mt-4 text-sm ${
                stat.trend === "up" ? "text-green-600" : "text-red-500"
              }`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sales Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Sales Overview
              </h2>
              <p className="text-sm text-slate-500">
                Restaurant sales performance
              </p>
            </div>

            <select className="select select-sm border-slate-300 focus:border-cafe-500 focus:outline-none">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          {/* Temporary chart area */}
          <div className="mt-6 flex h-72 items-center justify-center rounded-lg bg-cafe-50">
            <div className="text-center">
              <div className="text-5xl">📊</div>
              <p className="mt-3 text-slate-500">
                Sales chart will appear here
              </p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Top Products
            </h2>
            <button className="text-sm font-medium text-cafe-600 hover:text-cafe-700">
              View all
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {TOP_PRODUCTS.map((product) => (
              <div
                key={product.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cafe-50 text-xl">
                    {product.icon}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.sold}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-green-600">
                  {product.revenue}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Recent Orders
            </h2>
            <button className="text-sm font-medium text-cafe-600 hover:text-cafe-700">
              View all
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {RECENT_ORDERS.map((order, i) => (
              <div
                key={order.id}
                className={`flex items-center justify-between ${
                  i < RECENT_ORDERS.length - 1
                    ? "border-b border-slate-100 pb-4"
                    : ""
                }`}
              >
                <div>
                  <p className="font-medium text-slate-800">Order {order.id}</p>
                  <p className="text-sm text-slate-500">{order.customer}</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">{order.amount}</p>
                  <span className={`badge ${order.badge} badge-sm`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Low Stock Items
            </h2>
            <button className="text-sm font-medium text-cafe-600 hover:text-cafe-700">
              View all
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {LOW_STOCK.map((item, i) => (
              <div
                key={item.name}
                className={`flex items-center justify-between ${
                  i < LOW_STOCK.length - 1
                    ? "border-b border-slate-100 pb-4"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.remaining}</p>
                  </div>
                </div>
                <span className={`badge ${item.badge}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
