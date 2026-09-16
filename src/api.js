export const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export async function fetchJson(path, options) {
  const token = localStorage.getItem("cafe_popp_token");
  const headers = new Headers(options?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return response.json();
}
