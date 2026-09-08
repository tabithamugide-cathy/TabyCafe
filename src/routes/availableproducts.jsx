import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdFastfood,
  MdLocalDrink,
  MdRestaurant,
  MdOutlineFoodBank,
} from "react-icons/md";

export const Route = createFileRoute("/availableproducts")({
  component: RouteComponent,
});

const API_BASE = "http://localhost:8080/api";

async function fetchMenuItems() {
  const res = await fetch(`${API_BASE}/menu/items`);
  if (!res.ok) throw new Error("Couldn't load products.");
  return res.json();
}

async function fetchCategories() {
  const res = await fetch(`${API_BASE}/menu/categories`);
  if (!res.ok) throw new Error("Couldn't load categories.");
  return res.json();
}

// `available` is a query param on this endpoint, not a JSON body.
async function updateAvailability({ id, available }) {
  const res = await fetch(
    `${API_BASE}/menu/items/${id}/availability?available=${available}`,
    { method: "PATCH" },
  );
  if (!res.ok)
    throw new Error("Couldn't update availability. Please try again.");
  return res.json();
}

function getCategoryIcon(categoryName) {
  if (categoryName === "Fast foods") return <MdFastfood className="h-5 w-5" />;
  if (categoryName === "Cold drinks")
    return <MdLocalDrink className="h-5 w-5" />;
  if (categoryName === "Local foods")
    return <MdRestaurant className="h-5 w-5" />;
  return <MdOutlineFoodBank className="h-5 w-5" />;
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["menuItems"],
    queryFn: fetchMenuItems,
  });

  const { data: categoriesData = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const CATEGORIES = ["All categories", ...categoriesData.map((c) => c.name)];

  const mutation = useMutation({
    mutationFn: updateAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });

  const toggleAvailability = (product) => {
    mutation.mutate({ id: product.id, available: !product.available });
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "All categories" || p.categoryName === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const availableCount = products.filter((p) => p.available).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Availability</h1>
        <p className="mt-1 text-slate-500">
          Turn items on or off the menu without deleting them.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Available now</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {availableCount} / {products.length}
          </h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Unavailable</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {products.length - availableCount}
          </h2>
        </div>
      </div>

      {/* Filters + list */}
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
              placeholder="Search products..."
              className="input input-sm w-full border-slate-300 pl-9 focus:border-cafe-500 focus:outline-none"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select select-sm w-full border-slate-300 focus:border-cafe-500 focus:outline-none sm:w-52"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="p-10 text-center text-slate-400">Loading products...</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cafe-50 text-xl">
                    {getCategoryIcon(product.categoryName)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{product.name}</p>
                    <p className="text-xs text-slate-500">
                      {product.categoryName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium ${
                      product.available ? "text-green-600" : "text-slate-400"
                    }`}
                  >
                    {product.available ? "Available" : "Unavailable"}
                  </span>
                  <input
                    type="checkbox"
                    checked={product.available}
                    onChange={() => toggleAvailability(product)}
                    disabled={mutation.isPending}
                    className="toggle border-slate-300 [--tglbg:#fff] checked:bg-cafe-500 checked:border-cafe-500"
                    aria-label={`Toggle availability for ${product.name}`}
                  />
                </div>
              </li>
            ))}

            {filtered.length === 0 && (
              <li className="py-10 text-center text-slate-400">
                No products match your search.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
