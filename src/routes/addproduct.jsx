import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/addproduct")({
  component: RouteComponent,
});

const API_BASE = "http://localhost:8080/api";

async function fetchCategories() {
  const res = await fetch(`${API_BASE}/menu/categories`);
  if (!res.ok) throw new Error("Couldn't load categories.");
  return res.json();
}

// Backend's MenuItem POST endpoint expects the entity shape, not a DTO or
// FormData — { category: { id }, name, description, price, available, imageUrl }.
// There's no file-upload endpoint, so images are a plain URL string, and
// there's no "stock" field on MenuItem — stock only exists per-Ingredient.
async function createProduct(payload) {
  const res = await fetch(`${API_BASE}/menu/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const rawMessage = body.message || "";
    const friendlyMessage = rawMessage.includes("value too long")
      ? "One of the fields is too long — description and image URL must be 500 characters or fewer."
      : rawMessage || "Couldn't save the product. Please try again.";
    throw new Error(friendlyMessage);
  }
  return res.json();
}

const initialForm = {
  name: "",
  categoryId: "",
  price: "",
  description: "",
  status: "Available",
  imageUrl: "",
};

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      navigate({ to: "/products" });
    },
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Product name is required.";
    if (form.name.trim().length > 120)
      next.name = "Product name must be 120 characters or fewer.";
    if (!form.categoryId) next.categoryId = "Choose a category.";
    if (!form.price || Number(form.price) <= 0)
      next.price = "Enter a valid price.";
    if (form.description.trim().length > 500)
      next.description = "Description must be 500 characters or fewer.";
    if (form.imageUrl.trim().length > 500)
      next.imageUrl = "Image URL must be 500 characters or fewer.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate({
      category: { id: Number(form.categoryId) },
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      available: form.status === "Available",
      imageUrl: form.imageUrl.trim() || null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/products"
          className="btn btn-ghost btn-sm"
          aria-label="Back to products"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Add Product</h1>
          <p className="mt-1 text-slate-500">Add a new item to your menu.</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* Left: main details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">Details</h2>

            <div className="form-control w-full">
              <label className="label" htmlFor="name">
                <span className="label-text text-slate-600">Product name</span>
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Chicken Burger"
                maxLength={120}
                className={`input w-full border-slate-300 focus:border-cafe-500 focus:outline-none ${
                  errors.name ? "border-red-400" : ""
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="form-control w-full">
                <label className="label" htmlFor="category">
                  <span className="label-text text-slate-600">Category</span>
                </label>
                <select
                  id="category"
                  value={form.categoryId}
                  onChange={(e) => update("categoryId", e.target.value)}
                  disabled={categoriesLoading}
                  className={`select w-full border-slate-300 focus:border-cafe-500 focus:outline-none ${
                    errors.categoryId ? "border-red-400" : ""
                  }`}
                >
                  <option value="" disabled>
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.categoryId}
                  </p>
                )}
                {!categoriesLoading && categories.length === 0 && (
                  <p className="mt-1 text-xs text-slate-400">
                    No categories yet —{" "}
                    <Link to="/categories" className="underline">
                      create one first
                    </Link>
                    .
                  </p>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label" htmlFor="status">
                  <span className="label-text text-slate-600">
                    Availability
                  </span>
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  className="select w-full border-slate-300 focus:border-cafe-500 focus:outline-none"
                >
                  <option>Available</option>
                  <option>Unavailable</option>
                </select>
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label" htmlFor="price">
                <span className="label-text text-slate-600">Price (UGX)</span>
              </label>
              <input
                id="price"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="15000"
                className={`input w-full border-slate-300 focus:border-cafe-500 focus:outline-none ${
                  errors.price ? "border-red-400" : ""
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">{errors.price}</p>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label" htmlFor="description">
                <span className="label-text text-slate-600">
                  Description (optional)
                </span>
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Short description shown to staff or on the menu..."
                rows={4}
                maxLength={500}
                className={`textarea w-full border-slate-300 focus:border-cafe-500 focus:outline-none ${
                  errors.description ? "border-red-400" : ""
                }`}
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {form.description.length}/500
              </p>
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {mutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {mutation.error?.message}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link to="/products" className="btn btn-ghost">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn bg-cafe-500 border-cafe-500 text-white hover:bg-cafe-600 hover:border-cafe-600 disabled:opacity-60"
            >
              {mutation.isPending ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>

        {/* Right: image + preview */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Product Image
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              This backend stores an image URL, not an uploaded file — paste a
              link to a hosted image.
            </p>

            <div className="form-control mt-4 w-full">
              <label className="label" htmlFor="imageUrl">
                <span className="label-text text-slate-600">Image URL</span>
              </label>
              <input
                id="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="https://example.com/burger.jpg"
                maxLength={500}
                className={`input w-full border-slate-300 focus:border-cafe-500 focus:outline-none ${
                  errors.imageUrl ? "border-red-400" : ""
                }`}
              />
              {errors.imageUrl && (
                <p className="mt-1 text-xs text-red-500">{errors.imageUrl}</p>
              )}
            </div>

            <div className="mt-4 flex h-40 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-cafe-50/40">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Product preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-4xl">🍽️</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Preview</h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-cafe-50 text-2xl">
                🍽️
              </div>
              <div>
                <p className="font-medium text-slate-800">
                  {form.name || "New product"}
                </p>
                <p className="text-xs text-slate-500">
                  {form.price
                    ? `UGX ${Number(form.price).toLocaleString()}`
                    : "Price not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
