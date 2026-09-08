import React from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

const API_BASE = "http://localhost:8080/api";

// Backend Category only has { id, name } — there's no icon/description field,
// so we derive a stable decorative icon from the name on the frontend only.
const ICON_POOL = ["🍽️", "🍔", "🥤", "🍌", "🍕", "🍟", "🍟", "🍗", "🥗", "🍰"];
function iconFor(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return ICON_POOL[hash % ICON_POOL.length];
}

async function fetchCategories() {
  const res = await fetch(`${API_BASE}/menu/categories`);
  if (!res.ok) throw new Error("Couldn't load categories.");
  return res.json();
}

async function fetchMenuItems() {
  const res = await fetch(`${API_BASE}/menu/items`);
  if (!res.ok) throw new Error("Couldn't load menu items.");
  return res.json();
}

async function createCategory(payload) {
  const res = await fetch(`${API_BASE}/menu/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok)
    throw new Error("Couldn't create the category. Please try again.");
  return res.json();
}

export default function Categories() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Used only to compute a "X products" count per category, since the
  // Category entity itself doesn't track this.
  const { data: menuItems = [] } = useQuery({
    queryKey: ["menuItems"],
    queryFn: fetchMenuItems,
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setForm({ name: "" });
      setShowModal(false);
    },
    onError: (err) => setError(err.message),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }
    setError("");
    createMutation.mutate({ name: form.name.trim() });
  };

  const productCountFor = (categoryId) =>
    menuItems.filter((item) => item.categoryId === categoryId).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Categories</h1>
          <p className="mt-1 text-slate-500">
            Group your menu items so they're easy to browse and manage.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600"
        >
          + Add Category
        </button>
      </div>

      {categoriesError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {categoriesError.message}
        </div>
      )}

      {categoriesLoading ? (
        <p className="text-slate-500">Loading categories...</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const count = productCountFor(category.id);
            return (
              <div
                key={category.id}
                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cafe-50 text-2xl">
                    {iconFor(category.name)}
                  </div>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-800">
                  {category.name}
                </h2>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {count} product{count !== 1 ? "s" : ""}
                  </span>

                  <Link
                    to="/products"
                    search={{ category: category.name }}
                    className="text-sm font-medium text-cafe-600 hover:text-cafe-700"
                  >
                    View products →
                  </Link>
                </div>
              </div>
            );
          })}

          {categories.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
              No categories yet. Add one to start organizing your menu.
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                New Category
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="name">
                  <span className="label-text text-slate-600">Name</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Desserts"
                  className="input w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                  autoFocus
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
                  {createMutation.isPending ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
