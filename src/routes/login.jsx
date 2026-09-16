import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({ component: LoginPage });

// function RouteComponent() {
//   return <div>Hello "/login"!</div>
// }
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { API_BASE } from "../api";
import { useCart } from "../context/CartContext";

// Swap this out for your real auth call
async function loginRequest({ username, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: username, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.message || "Couldn't sign you in. Check your details and try again.",
    );
  }
  return res.json();
}

const TASTING_NOTES = [
  { label: "TODAY'S ROAST", value: "Ethiopian Yirgacheffe" },
  { label: "NOTES", value: "Bergamot · Stone fruit · Honey" },
  { label: "BARISTA'S PICK", value: "Oat Cortado" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { updateSettings } = useCart();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      if (data?.token) localStorage.setItem("cafe_popp_token", data.token);
      if (data?.role) {
        updateSettings({
          name: data.fullName,
          email: data.email,
          role: data.role,
        });
      }
      const landingPages = {
        ADMIN: "/dashboard",
        CASHIER: "/dashboard",
        WAITER: "/tables",
        KITCHEN: "/orders",
      };
      navigate({ to: landingPages[data.role] ?? "/" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    mutation.mutate({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen w-full flex bg-[#1B1410]">
      {/* LEFT — menu board panel */}
      <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between p-12 overflow-hidden bg-[#1B1410]">
        {/* subtle chalkboard texture via layered radial gradients */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #fff 0.5px, transparent 0.5px), radial-gradient(circle at 70% 65%, #fff 0.5px, transparent 0.5px)",
            backgroundSize: "3px 3px, 4px 4px",
          }}
        />

        <div className="relative">
          <div className="flex items-baseline gap-2">
            <span
              className="text-[#F2660D] text-5xl tracking-tight"
              style={{
                fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
                fontWeight: 600,
              }}
            >
              Cafe Popp
            </span>
          </div>
          <div className="mt-2 h-px w-16 bg-[#BC3A09]" />
          <p
            className="mt-4 text-[#E8DDD0]/60 text-sm tracking-[0.2em] uppercase"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Restaurant Management
          </p>
        </div>

        <div className="relative space-y-6">
          <p
            className="text-[#E8DDD0]/40 text-xs uppercase tracking-[0.25em]"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            On the board today
          </p>
          <div className="space-y-4">
            {TASTING_NOTES.map((n) => (
              <div
                key={n.label}
                className="flex items-baseline justify-between border-b border-dashed border-[#BC3A09]/40 pb-2"
              >
                <span
                  className="text-[#F2660D] text-[11px] tracking-[0.15em] uppercase"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {n.label}
                </span>
                <span
                  className="text-[#F5EDE4] text-sm italic"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {n.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p
          className="relative text-[#E8DDD0]/30 text-xs"
          style={{ fontFamily: "Georgia, serif" }}
        >
          "Every table has a story. We just pour the coffee."
        </p>
      </div>

      {/* RIGHT — the actual ticket / form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F5EDE4]">
        <div className="w-full max-w-sm">
          {/* mobile-only brand mark */}
          <div className="lg:hidden mb-8 text-center">
            <span
              className="text-[#1B1410] text-4xl"
              style={{
                fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
                fontWeight: 600,
              }}
            >
              Cafe Popp
            </span>
          </div>

          <div className="bg-[#E8DDD0] rounded-sm shadow-xl relative">
            {/* perforated top edge, like a ticket stub */}
            <div className="absolute -top-2 left-0 right-0 flex justify-between px-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#F5EDE4]" />
              ))}
            </div>

            <div className="px-8 pt-10 pb-8">
              <p
                className="text-[#BC3A09] text-xs tracking-[0.3em] uppercase text-center mb-1"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Order #001 · Staff Entry
              </p>
              <h1
                className="text-[#1B1410] text-2xl text-center mb-8"
                style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
              >
                Table for one?
              </h1>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="form-control w-full">
                  <label className="label pb-1" htmlFor="username">
                    <span
                      className="label-text text-[#1B1410]/70 text-xs tracking-[0.1em] uppercase"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      Username
                    </span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. j.baker"
                    className="input w-full bg-[#F5EDE4] border-[#BC3A09]/30 focus:border-[#F2660D] focus:outline-none text-[#1B1410] placeholder:text-[#1B1410]/30 rounded-sm"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label pb-1" htmlFor="password">
                    <span
                      className="label-text text-[#1B1410]/70 text-xs tracking-[0.1em] uppercase"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      Password
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input w-full bg-[#F5EDE4] border-[#BC3A09]/30 focus:border-[#F2660D] focus:outline-none text-[#1B1410] placeholder:text-[#1B1410]/30 rounded-sm pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-wider uppercase text-[#BC3A09] hover:text-[#F2660D]"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-[#BC3A09]/40 [--chkbg:#F2660D] [--chkfg:#F5EDE4]"
                    />
                    <span
                      className="text-[#1B1410]/60 text-xs"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-[#BC3A09] text-xs hover:text-[#F2660D] underline underline-offset-2"
                  >
                    Forgot password?
                  </a>
                </div>

                {mutation.isError && (
                  <div className="text-red-800 bg-red-100 border border-red-300 text-xs px-3 py-2 rounded-sm">
                    {mutation.error?.message ||
                      "Couldn't sign you in. Check your details and try again."}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full mt-2 bg-[#1B1410] hover:bg-[#2a1f18] disabled:opacity-60 text-[#F5EDE4] py-3 rounded-sm tracking-[0.2em] uppercase text-sm transition-colors relative overflow-hidden"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {mutation.isPending ? "Ringing it up…" : "Punch in"}
                </button>
              </form>
            </div>

            {/* torn stub bottom edge */}
            <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#F5EDE4]" />
              ))}
            </div>
          </div>

          <p
            className="text-center text-[#1B1410]/40 text-xs mt-8"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Not staff? Ask your manager for an account.
          </p>
        </div>
      </div>
    </div>
  );
}
