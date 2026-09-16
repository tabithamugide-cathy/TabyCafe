import { Link, useNavigate } from "@tanstack/react-router";
import {
  BsBell,
  BsBoxArrowRight,
  BsCart3,
  BsChevronDown,
  BsGear,
  BsList,
  BsPerson,
} from "react-icons/bs";
import { useCart } from "./context/CartContext";

export default function Navbar() {
  const { settings, cartItems, logout } = useCart();
  const navigate = useNavigate();
  const user = {
    ...settings,
    initials: settings.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
  const cartCount = Object.values(cartItems).reduce((total, count) => total + count, 0);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] w-full items-center border-b border-[#eadfd5] bg-[#fffdfb]/95 px-4 backdrop-blur lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-4">
        <label
          htmlFor="my-drawer-4"
          aria-label="Toggle sidebar"
          className="btn btn-square btn-ghost drawer-button text-slate-600 transition-colors duration-200 hover:bg-cafe-50 hover:text-cafe-700"
        >
          <BsList className="h-5 w-5" />
        </label>

        <div className="hidden leading-tight sm:block">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-cafe-700">
            Hello, {user.name.split(" ")[0]}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#2b211c]">Welcome back</p>
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        <button
          className="btn btn-circle btn-ghost relative text-slate-600 transition-colors duration-200 hover:bg-cafe-50 hover:text-cafe-700"
          aria-label="Notifications"
        >
          <BsBell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#fffdfb] bg-orange-500 text-[10px] font-bold text-white">
            5
          </span>
        </button>

        {/* Current order */}
        <Link
          to="/orders"
          search={{ status: "Pending" }}
          className="hidden items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-cafe-50 sm:flex"
        >
          <div className="relative">
            <BsCart3 className="h-5 w-5 text-slate-600" />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#fffdfb] bg-cafe-500 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          </div>

          <div className="text-left">
            <p className="text-xs text-slate-500">Current Order</p>
            <p className="text-sm font-semibold text-slate-800">Current basket</p>
          </div>
        </Link>

        {/* Divider between actions and profile */}
        <div className="mx-1 hidden h-8 w-px bg-[#eadfd5] sm:block" />

        {/* Profile */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-cafe-50"
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cafe-500 font-bold text-white shadow-sm">
              {user.initials}
            </div>

            <BsChevronDown className="hidden h-4 w-4 text-slate-400 transition-transform duration-200 group-focus:rotate-180 md:block" />
          </div>

          {/* Dropdown */}
          <ul
            tabIndex={0}
            className="dropdown-content menu z-[50] mt-3 w-64 rounded-xl border border-[#eadfd5] bg-white p-2 shadow-xl"
          >
            <li className="mb-1">
              <div className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-transparent">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cafe-500 font-bold text-white shadow-sm">
                  {user.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
              </div>
            </li>

            <div className="divider my-1 before:bg-[#eadfd5] after:bg-[#eadfd5]" />

            <li>
              <Link
                to="/settings"
                className="rounded-lg text-slate-700 transition-colors duration-150 hover:bg-cafe-50 hover:text-cafe-700"
              >
                <BsPerson className="h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="rounded-lg text-slate-700 transition-colors duration-150 hover:bg-cafe-50 hover:text-cafe-700"
              >
                <BsGear className="h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </li>
            <li>
              <a className="rounded-lg text-slate-700 transition-colors duration-150 hover:bg-cafe-50 hover:text-cafe-700">
                <BsGear className="h-4 w-4" />
                <span>Change Password</span>
              </a>
            </li>

            <div className="divider my-1 before:bg-[#eadfd5] after:bg-[#eadfd5]" />

            <li>
              <button
                onClick={handleLogout}
                className="w-full rounded-lg text-left text-orange-600 transition-colors duration-150 hover:bg-orange-50"
              >
                <BsBoxArrowRight className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}