import React from "react";
import { Link } from "@tanstack/react-router";

export default function Navbar() {
  const user = {
    name: "Tabitha Mugide",
    role: "Administrator",
    initials: "TM",
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center border-b border-slate-200 bg-white px-4 shadow-sm lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Sidebar toggle — one control, works on every breakpoint */}
        <label
          htmlFor="my-drawer-4"
          aria-label="Toggle sidebar"
          className="btn btn-square btn-ghost drawer-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>

        <div className="hidden sm:block leading-tight">
          <p className="text-sm text-slate-500">
            Hello, {user.name.split(" ")[0]}
          </p>
          <p className="text-sm font-semibold text-slate-800">Welcome back</p>
        </div>
      </div>

      {/* Search */}
      <div className="mx-4 hidden flex-1 md:flex md:justify-center">
        <div className="relative w-full max-w-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
            />
          </svg>

          <input
            type="text"
            placeholder="Search anything..."
            className="input w-full border-0 bg-slate-100 pl-12 pr-20 focus:outline-none focus:ring-2 focus:ring-cafe-500"
          />

          <kbd className="kbd kbd-sm absolute right-3 top-1/2 -translate-y-1/2">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <button
          className="btn btn-circle btn-ghost relative"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.5-2V10a6.5 6.5 0 00-13 0v5L4 17h5m3 4a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 21z"
            />
          </svg>

          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
            5
          </span>
        </button>

        {/* Current order */}
        <Link
          to="/orders"
          search={{ status: "Pending" }}
          className="hidden items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100 sm:flex"
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
              className="h-6 w-6 text-slate-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l2.4 12.2a2 2 0 002 1.6h8.8a2 2 0 002-1.6L22 7H6"
              />
              <circle cx="10" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
            </svg>

            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-cafe-500 text-xs font-bold text-white">
              3
            </span>
          </div>

          <div className="text-left">
            <p className="text-xs text-slate-500">Current Order</p>
            <p className="text-sm font-semibold text-slate-800">UGX 45,000</p>
          </div>
        </Link>

        {/* Profile */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-100"
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-800">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cafe-500 font-bold text-white">
              {user.initials}
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="hidden h-4 w-4 md:block"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 9l6 6 6-6"
              />
            </svg>
          </div>

          {/* Dropdown */}
          <ul
            tabIndex={0}
            className="dropdown-content menu z-[50] mt-3 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
          >
            <li className="mb-2">
              <div className="flex items-center gap-3 px-3 py-3 hover:bg-transparent">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cafe-500 font-bold text-white">
                  {user.initials}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
              </div>
            </li>

            <div className="divider my-1"></div>

            <li>
              <a>
                👤
                <span>My Profile</span>
              </a>
            </li>
            <li>
              <a>
                ⚙️
                <span>Account Settings</span>
              </a>
            </li>
            <li>
              <a>
                🔒
                <span>Change Password</span>
              </a>
            </li>

            <div className="divider my-1"></div>

            <li>
              <a className="text-orange-500 hover:bg-orange-100">
                🚪
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
