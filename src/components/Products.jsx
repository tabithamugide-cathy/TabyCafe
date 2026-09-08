import React from "react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiSearch,
  FiPlus,
  FiPackage,
  FiDownload,
  FiTrendingUp,
} from "react-icons/fi";
import {
  BsBox,
  BsCartX,
  BsCheckCircle,
  BsArrowUp,
  BsArrowDown,
  BsGrid,
} from "react-icons/bs";
import {
  MdFastfood,
  MdLocalDrink,
  MdRestaurant,
  MdOutlineFoodBank,
  MdOutlineRestaurantMenu,
} from "react-icons/md";
import { HiOutlineRefresh } from "react-icons/hi";

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

// Availability is the only thing this backend lets us update after creation —
// `available` goes as a query param, not a JSON body.
async function updateAvailability({ id, available }) {
  const res = await fetch(
    `${API_BASE}/menu/items/${id}/availability?available=${available}`,
    { method: "PATCH" },
  );
  if (!res.ok) throw new Error("Couldn't update availability.");
  return res.json();
}

// Backend has no per-item icon — derive one from the category name for display only.
function getCategoryIcon(categoryName) {
  if (categoryName === "Fast foods") return <MdFastfood className="h-5 w-5" />;
  if (categoryName === "Cold drinks")
    return <MdLocalDrink className="h-5 w-5" />;
  if (categoryName === "Local foods")
    return <MdRestaurant className="h-5 w-5" />;
  return <MdOutlineFoodBank className="h-5 w-5" />;
}

function formatUGX(amount) {
  return `UGX ${Math.round(amount).toLocaleString()}`;
}

export default function Products({
  search: searchParam,
  category: categoryParam,
}) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState(searchParam ?? "");
  const [category, setCategory] = useState(categoryParam ?? "All categories");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Stay in sync if navigated here again with a different ?category=
  useEffect(() => {
    setCategory(categoryParam ?? "All categories");
  }, [categoryParam]);

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

  const availabilityMutation = useMutation({
    mutationFn: updateAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });

  const CATEGORIES = ["All categories", ...categoriesData.map((c) => c.name)];

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "All categories" || p.categoryName === category;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "price") {
        comparison = a.price - b.price;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [products, search, category, sortField, sortDirection]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <BsArrowUp className="h-3 w-3" />
    ) : (
      <BsArrowDown className="h-3 w-3" />
    );
  };

  const availableCount = products.filter((p) => p.available).length;
  const unavailableCount = products.length - availableCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-3 text-white shadow-lg">
              <MdOutlineRestaurantMenu className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                All Products
              </h1>
              <p className="mt-1 flex items-center gap-2 text-slate-500">
                <FiPackage className="h-4 w-4" />
                Manage your menu items, pricing, and availability.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50">
            <FiDownload className="h-4 w-4" />
            Export
          </button>
          <Link
            to="/addproduct"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:brightness-110"
          >
            <FiPlus className="h-5 w-5" />
            Add Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Products</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {products.length}
              </h2>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 text-orange-600 transition group-hover:scale-110">
              <BsBox className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Available</p>
              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {availableCount}
              </h2>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-green-600 transition group-hover:scale-110">
              <FiTrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Unavailable</p>
              <h2 className="mt-2 text-3xl font-bold text-red-500">
                {unavailableCount}
              </h2>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-red-600 transition group-hover:scale-110">
              <BsCartX className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters + Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-slate-100">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      category === c
                        ? "bg-orange-500 text-white shadow"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {c === "All categories" ? (
                      <BsGrid className="h-3 w-3" />
                    ) : (
                      getCategoryIcon(c)
                    )}
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["menuItems"] })
              }
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              <HiOutlineRefresh className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="p-4">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 hover:text-slate-700"
                  >
                    Product {getSortIcon("name")}
                  </button>
                </th>
                <th className="p-4">Category</th>
                <th className="p-4">
                  <button
                    onClick={() => toggleSort("price")}
                    className="flex items-center gap-1 hover:text-slate-700"
                  >
                    Price {getSortIcon("price")}
                  </button>
                </th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-50 transition hover:bg-orange-50/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-50 to-red-50 text-xl shadow-sm">
                          {getCategoryIcon(product.categoryName)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="mt-0.5 max-w-xs truncate text-xs text-slate-400">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {getCategoryIcon(product.categoryName)}
                        {product.categoryName}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {formatUGX(product.price)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                          product.available
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {product.available ? (
                          <BsCheckCircle className="h-4 w-4" />
                        ) : (
                          <BsCartX className="h-4 w-4" />
                        )}
                        {product.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            availabilityMutation.mutate({
                              id: product.id,
                              available: !product.available,
                            })
                          }
                          disabled={availabilityMutation.isPending}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          Mark {product.available ? "unavailable" : "available"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                        <FiSearch className="h-8 w-8" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-slate-800">
                        No products found
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Try adjusting your search or filter to find what you're
                        looking for.
                      </p>
                      <button
                        onClick={() => {
                          setSearch("");
                          setCategory("All categories");
                        }}
                        className="mt-4 flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
                      >
                        <HiOutlineRefresh className="h-4 w-4" />
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {products.length}
            </span>{" "}
            products
          </p>
        </div>
      </div>
    </div>
  );
}
