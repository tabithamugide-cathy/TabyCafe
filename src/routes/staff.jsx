import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/staff")({
  component: RouteComponent,
});

const ROLES = [
  "Administrator",
  "Manager",
  "Cashier",
  "Waiter",
  "Chef",
  "Barista",
];

// Swap for data fetched via useQuery once your API is wired up
const INITIAL_STAFF = [
  {
    id: 1,
    name: "Tabitha Mugide",
    role: "Administrator",
    phone: "0772 000 111",
    email: "tabitha@cafepopp.com",
    status: "Active",
    joined: "Jan 2025",
  },
  {
    id: 2,
    name: "Brian Tumwesigye",
    role: "Manager",
    phone: "0700 222 333",
    email: "brian@cafepopp.com",
    status: "Active",
    joined: "Mar 2025",
  },
  {
    id: 3,
    name: "Faith Auma",
    role: "Barista",
    phone: "0774 444 555",
    email: "faith@cafepopp.com",
    status: "Active",
    joined: "Jun 2025",
  },
  {
    id: 4,
    name: "Peter Wanyama",
    role: "Waiter",
    phone: "0755 666 777",
    email: "peter@cafepopp.com",
    status: "On leave",
    joined: "Aug 2025",
  },
  {
    id: 5,
    name: "Diana Lamunu",
    role: "Chef",
    phone: "0701 888 999",
    email: "diana@cafepopp.com",
    status: "Active",
    joined: "Feb 2025",
  },
  {
    id: 6,
    name: "Kevin Mugisha",
    role: "Cashier",
    phone: "0788 111 222",
    email: "kevin@cafepopp.com",
    status: "Inactive",
    joined: "Nov 2024",
  },
];

const initialForm = { name: "", role: ROLES[0], phone: "", email: "" };

const STATUS_BADGE = {
  Active: "badge-success",
  "On leave": "badge-warning",
  Inactive: "badge-ghost",
};

// Swap for your real endpoint
async function createStaff(payload) {
  const res = await fetch("/api/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok)
    throw new Error("Couldn't save this staff member. Please try again.");
  return res.json();
}

async function updateStaffStatus({ id, status }) {
  const res = await fetch(`/api/staff/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Couldn't update status.");
  return res.json();
}

function initialsOf(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function RouteComponent() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: (data) => {
      setStaff((prev) => [
        {
          id: data.id ?? Date.now(),
          ...form,
          status: "Active",
          joined: "Just now",
        },
        ...prev,
      ]);
      setForm(initialForm);
      setShowModal(false);
    },
    onError: (err) => setError(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: updateStaffStatus,
    onError: (_err, variables) => {
      // revert optimistic change on failure
      setStaff((prev) =>
        prev.map((s) =>
          s.id === variables.id ? { ...s, status: variables.previous } : s,
        ),
      );
    },
  });

  const cycleStatus = (member) => {
    const order = ["Active", "On leave", "Inactive"];
    const next = order[(order.indexOf(member.status) + 1) % order.length];
    setStaff((prev) =>
      prev.map((s) => (s.id === member.id ? { ...s, status: next } : s)),
    );
    statusMutation.mutate({
      id: member.id,
      status: next,
      previous: member.status,
    });
  };

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All roles" || s.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staff, search, roleFilter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Staff name is required.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    setError("");
    createMutation.mutate(form);
  };

  const activeCount = staff.filter((s) => s.status === "Active").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Staff</h1>
          <p className="mt-1 text-slate-500">
            Manage your team, roles, and shift status.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600"
        >
          + Add Staff
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Staff</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {staff.length}
          </h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Now</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {activeCount}
          </h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Roles</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {new Set(staff.map((s) => s.role)).size}
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
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
              placeholder="Search staff..."
              className="input input-sm w-full border-slate-300 pl-9 focus:border-cafe-500 focus:outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select select-sm w-full border-slate-300 focus:border-cafe-500 focus:outline-none sm:w-52"
          >
            <option>All roles</option>
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th>Staff Member</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-cafe-50/50">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cafe-500 text-sm font-bold text-white">
                        {initialsOf(member.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-600">{member.role}</td>
                  <td className="text-slate-600">{member.phone}</td>
                  <td className="text-slate-500">{member.joined}</td>
                  <td>
                    <button
                      onClick={() => cycleStatus(member)}
                      className={`badge ${STATUS_BADGE[member.status]} badge-sm cursor-pointer`}
                      title="Click to change status"
                    >
                      {member.status}
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No staff match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                New Staff Member
              </h2>
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
                <label className="label" htmlFor="s-name">
                  <span className="label-text text-slate-600">Full name</span>
                </label>
                <input
                  id="s-name"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Grace Nabirye"
                  className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="s-role">
                  <span className="label-text text-slate-600">Role</span>
                </label>
                <select
                  id="s-role"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className="select w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label" htmlFor="s-phone">
                  <span className="label-text text-slate-600">
                    Phone number
                  </span>
                </label>
                <input
                  id="s-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="e.g. 0700 123 456"
                  className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="s-email">
                  <span className="label-text text-slate-600">
                    Email (optional)
                  </span>
                </label>
                <input
                  id="s-email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="e.g. grace@cafepopp.com"
                  className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600 disabled:opacity-60"
                >
                  {createMutation.isPending ? "Saving..." : "Save Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
