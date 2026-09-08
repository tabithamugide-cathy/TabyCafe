import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { CartProvider } from "../context/CartContext";

const RootLayout = () => (
  <CartProvider>
    <div className="drawer lg:drawer-open">
      <input
        id="my-drawer-4"
        type="checkbox"
        className="drawer-toggle inline"
      />
      <div className="drawer-content">
        {/* Navbar */}
        <Navbar />
        {/* Page content here */}
        <Outlet />
      </div>{" "}
      <Sidebar />
    </div>

    {/* <TanStackRouterDevtools /> */}
  </CartProvider>
);

export const Route = createRootRoute({ component: RootLayout });
