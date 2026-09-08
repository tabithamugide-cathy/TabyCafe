import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/customers")({
  component: RouteComponent,
});

// Swap for data fetched via useQuery once your API is wired up
const INITIAL_CUSTOMERS = [
  { id: 1, name: "John Doe", phone: "0772 123 456", email: "john.doe@example.com", visits: 14, totalSpent: 620000, lastVisit: "Aug 30, 2026" },
  { id: 2, name: "Sarah K.", phone: "0701 987 654", email: "sarah.k@example.com", visits: 9, totalSpent: 288000, lastVisit: "Aug 29, 2026" },
  { id: 3, name: "Michael O.", phone: "0755 456 789", email: "michael.o@example.com", visits: 22, totalSpent: 1140000, lastVisit: "Aug 31, 2026" },
  { id: 4, name: "Grace N.", phone: "0788 321 654", email: "", visits: 3, totalSpent: 54000, lastVisit: "Aug 25, 2026" },
  { id: 5, name: "Brian T.", phone: "0700 111 222", email: "brian.t@example.com", visits: 6, totalSpent: 210000, lastVisit: "Aug 28, 2026" },
  { id: 6, name: "Faith A.", phone: "0774 555 999", email: "faith.a@example.com", visits: 17, totalSpent: 705000, lastVisit: "Aug 31, 2026" },
];

const initialForm = { name: "", phone: "", email: "" };

// Swap for your real endpoint
async function createCustomer(payload) {
  const res = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Couldn't save the customer. Please try again.");
  return res.json();
}

function formatUGX(amount) {
  return `UGX ${amount.toLocaleString()}`;
}

function initialsOf(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function loyaltyTier(visits) {
  if (visits >= 20) return { label: "Gold", badge: "badge-warning" };
  if (visits >= 10) return { label: "Silver", badge: "badge-neutral" };
  return { label: "New", badge: "badge-ghost" };
}

function RouteComponent() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (data) => {
      setCustomers((prev) => [
        {
          id: data.id ?? Date.now(),
          ...form,
          visits: 0,
          totalSpent: 0,
          lastVisit: "—",
        },
        ...prev,
      ]);
      setForm(initialForm);
      setShowModal(false);
    },
    onError: (err) => setError(err.message),
  });

  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );
  }, [customers, search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    setError("");
    createMutation.mutate(form);
  };

  const totalCustomers = customers.length;
  const returningCustomers = customers.filter((c) => c.visits > 1).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Customers</h1>
          <p className="mt-1 text-slate-500">
            Keep track of who's dining with you and how often.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600"
        >
          + Add Customer
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Customers</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">{totalCustomers}</h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Returning Customers</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">{returningCustomers}</h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Lifetime Revenue</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">{formatUGX(totalRevenue)}</h2>
        </div>
      </div>

      {/* Table */}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone..."
              className="input input-sm w-full border-slate-300 pl-9 focus:border-cafe-500 focus:outline-none"
            />
          </div>

          <p className="hidden text-sm text-slate-500 sm:block">
            {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th>Customer</th>
                <th>Phone</th>
                <th>Visits</th>
                <th>Total Spent</th>
                <th>Tier</th>
                <th>Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                const tier = loyaltyTier(customer.visits);
                return (
                  <tr key={customer.id} className="hover:bg-cafe-50/50">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cafe-500 text-sm font-bold text-white">
                          {initialsOf(customer.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{customer.name}</p>
                          {customer.email && (
                            <p className="text-xs text-slate-500">{customer.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600">{customer.phone}</td>
                    <td className="text-slate-600">{customer.visits}</td>
                    <td className="text-slate-800">{formatUGX(customer.totalSpent)}</td>
                    <td>
                      <span className={`badge ${tier.badge} badge-sm`}>{tier.label}</span>
                    </td>
                    <td className="text-slate-500">{customer.lastVisit}</td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">New Customer</h2>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="c-name">
                  <span className="label-text text-slate-600">Full name</span>
                </label>
                <input
                  id="c-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Jane Achieng"
                  className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="c-phone">
                  <span className="label-text text-slate-600">Phone number</span>
                </label>
                <input
                  id="c-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. 0700 123 456"
                  className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="c-email">
                  <span className="label-text text-slate-600">Email (optional)</span>
                </label>
                <input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. jane@example.com"
                  className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600 disabled:opacity-60"
                >
                  {createMutation.isPending ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}