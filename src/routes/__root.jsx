import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { CartProvider } from "../context/CartContext";
import { Link } from "@tanstack/react-router";
import { useCart } from "../context/CartContext";

function GuestHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#eadfd5] bg-[#fffdfb]/95 px-5 backdrop-blur sm:px-8">
      <Link to="/" className="text-xl font-bold tracking-tight text-[#2b211c]">
        Cafe<span className="text-cafe-500">Popp</span>
      </Link>
      <nav className="flex items-center gap-3 text-sm font-semibold">
        <Link to="/cart" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-cafe-50 hover:text-cafe-700">
          My order
        </Link>
        <Link to="/login" className="rounded-lg bg-cafe-500 px-4 py-2 text-white shadow-sm hover:bg-cafe-600">
          Staff login
        </Link>
      </nav>
    </header>
  );
}

const STAFF_PATHS = [
  "/dashboard", "/foodmenu", "/orders", "/tables", "/payments", "/products", "/addproduct",
  "/availableproducts", "/categories", "/customers", "/staff", "/stock", "/reports", "/settings",
];

const ROLE_PATHS = {
  ADMIN: STAFF_PATHS,
  CASHIER: ["/dashboard", "/foodmenu", "/orders", "/tables", "/payments", "/customers", "/settings"],
  WAITER: ["/foodmenu", "/orders", "/tables", "/customers", "/settings"],
  KITCHEN: ["/foodmenu", "/orders", "/settings"],
};

function AccessDenied({ message }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-[#eadfd5] bg-[#fffdfb] p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cafe-700">CafePopp access</p>
        <h1 className="mt-3 text-2xl font-bold text-[#2b211c]">Staff access required</h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <Link to="/" className="btn mt-6 bg-cafe-500 text-white hover:bg-cafe-600">Return to guest menu</Link>
      </div>
    </div>
  );
}

const RootLayout = () => {
  return (
    <CartProvider>
      <AppShell />
    </CartProvider>
  );
};

function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { settings } = useCart();
  const isStaffRoute = STAFF_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const token = localStorage.getItem("cafe_popp_token");
  const role = settings.role.toUpperCase() === "ADMINISTRATOR" ? "ADMIN" : settings.role.toUpperCase();
  const allowedPaths = ROLE_PATHS[role] ?? [];
  const isRoleAllowed = allowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <>
      {isStaffRoute && !token ? (
        <div className="min-h-screen bg-[#f8f5f1]"><GuestHeader /><AccessDenied message="Sign in with a staff account to continue." /></div>
      ) : isStaffRoute && !isRoleAllowed ? (
        <div className="min-h-screen bg-[#f8f5f1]"><GuestHeader /><AccessDenied message={`Your ${settings.role} account does not have access to this area.`} /></div>
      ) : isStaffRoute ? (
        <div className="drawer">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle inline" />
          <div className="drawer-content min-h-screen bg-[#f8f5f1]">
            <Navbar />
            <div className="mx-auto w-full max-w-[1600px]"><Outlet /></div>
          </div>
          <Sidebar />
        </div>
      ) : (
        <div className="min-h-screen bg-[#f8f5f1]">
          <GuestHeader />
          <div className="mx-auto w-full max-w-[1600px]"><Outlet /></div>
        </div>
      )}
    </>
  );
}

export const Route = createRootRoute({ component: RootLayout });
