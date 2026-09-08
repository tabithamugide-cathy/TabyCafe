import { Link } from "@tanstack/react-router";
import React from "react";
import { CiLogout } from "react-icons/ci";
import { RxDashboard } from "react-icons/rx";
import { BiFoodMenu } from "react-icons/bi";
/* Reusable icon so every entry is easy to swap without repeating the svg boilerplate */
function Icon({ path, children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeWidth="2"
      fill="none"
      stroke="currentColor"
      className="my-1.5 inline-block size-4 shrink-0"
    >
      {children}
    </svg>
  );
}

const NAV_SECTIONS = [
  {
    type: "link",
    label: "Dashboard",
    to: "/dashboard",
    icon: <RxDashboard size={16} className="text-orange-500" />,
  },

  {
    type: "link",
    label: "Foodmenu",
    to: "/foodmenu",
    icon: <BiFoodMenu size={16} className="text-orange-500" />,
  },

  {
    type: "group",
    label: "Orders",
    icon: (
      <Icon>
        <path d="M6 2h12l1 5H5z" />
        <path d="M5 7v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7" />
        <path d="M9 11h6M9 15h6" />
      </Icon>
    ),
    items: [
      { label: "All orders", to: "/orders", search: { status: "All" } },
      // { label: "Pending", to: "/orders", search: { status: "Pending" } },
      // { label: "Preparing", to: "/orders", search: { status: "Preparing" } },
      // { label: "Ready", to: "/orders", search: { status: "Ready" } },
      // { label: "Finished", to: "/orders", search: { status: "Finished" } },
      // { label: "Cancelled", to: "/orders", search: { status: "Cancelled" } },
    ],
  },

  {
    type: "group",
    label: "Products",
    icon: (
      <Icon>
        <path d="M20.5 7.3 12 12l-8.5-4.7" />
        <path d="M12 22V12" />
        <path d="m3.5 7.3 8.5-4.7 8.5 4.7v9.4l-8.5 4.7-8.5-4.7Z" />
      </Icon>
    ),
    items: [
      { label: "All products", to: "/products" },
      { label: "Add product", to: "/addproduct" },
      { label: "Availability", to: "/availableproducts" },
    ],
  },
  {
    type: "link",
    label: "Categories",
    to: "/categories",
    icon: (
      <Icon>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </Icon>
    ),
  },
  {
    type: "group",
    label: "Inventory",
    icon: (
      <Icon>
        <path d="M21 8 12 3 3 8v8l9 5 9-5Z" />
        <path d="M3 8l9 5 9-5M12 13v8" />
      </Icon>
    ),
    items: [
      { label: "Stock", to: "/stock", search: { tab: "Stock" } },
      { label: "Low stock", to: "/stock", search: { tab: "Low Stock" } },
      { label: "Stock in", to: "/stock", search: { tab: "Stock In" } },
      { label: "Stock history", to: "/stock", search: { tab: "History" } },
    ],
  },
  {
    type: "link",
    label: "Customers",
    to: "/customers",
    icon: (
      <Icon>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M22 21v-1a5.5 5.5 0 0 0-4-5.3" />
      </Icon>
    ),
  },
  {
    type: "link",
    label: "Staff",
    to: "/staff",
    icon: (
      <Icon>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </Icon>
    ),
  },
  {
    type: "link",
    label: "Tables",
    to: "/tables",
    icon: (
      <Icon>
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
        <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      </Icon>
    ),
  },
  {
    type: "link",
    label: "Payments",
    to: "/payments",
    icon: (
      <Icon>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </Icon>
    ),
  },
  {
    type: "link",
    label: "Reports",
    to: "/reports",
    icon: (
      <Icon>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-5 3 3 5-7" />
      </Icon>
    ),
  },
  {
    type: "link",
    label: "Settings",
    to: "/settings",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.43.7.72 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </Icon>
    ),
  },
  {
    type: "link",
    label: "About",
    to: "/about",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 16v-4M12 8h.01" />
      </Icon>
    ),
  },
];

export default function Sidebar() {
  return (
    <div className="drawer-side is-drawer-close:overflow-visible">
      <label
        htmlFor="my-drawer-4"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>

      <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64 border-r border-base-300">
        {/* Brand */}
        <div className="w-full px-4 py-5 is-drawer-close:px-0 is-drawer-close:flex is-drawer-close:justify-center">
          <h1 className="text-xl font-bold whitespace-nowrap is-drawer-close:hidden">
            <span className="text-base-content">Taby's</span>{" "}
            <span className="text-cafe-500">CafePopp</span>
          </h1>
          <span className="hidden is-drawer-close:inline text-cafe-500 font-bold text-lg">
            CP
          </span>
        </div>

        {/* Nav */}
        <ul className="menu w-full grow">
          {NAV_SECTIONS.map((section) =>
            section.type === "link" ? (
              <li key={section.label}>
                <Link
                  to={section.to}
                  className="[&.active]:font-semibold [&.active]:bg-cafe-500/10 [&.active]:text-cafe-600"
                  activeProps={{ className: "active" }}
                >
                  {section.icon}
                  <span className="is-drawer-close:hidden">
                    {section.label}
                  </span>
                </Link>
              </li>
            ) : (
              <li key={section.label}>
                <details>
                  <summary>
                    {section.icon}
                    <span className="is-drawer-close:hidden">
                      {section.label}
                    </span>
                  </summary>
                  <ul className="is-drawer-close:absolute is-drawer-close:left-full is-drawer-close:top-0 is-drawer-close:z-50 is-drawer-close:w-48 is-drawer-close:rounded-box is-drawer-close:bg-base-200 is-drawer-close:shadow-lg">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          search={item.search}
                          className="[&.active]:font-semibold [&.active]:text-cafe-600"
                          activeProps={{ className: "active" }}
                        >
                          <span className="is-drawer-close:hidden">
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ),
          )}
        </ul>

        {/* Footer / current user */}
        <div className="w-full border-t border-base-300 p-3 is-drawer-close:flex is-drawer-close:justify-center">
          <button className="btn btn-ghost btn-sm w-full justify-start gap-2 is-drawer-close:w-auto is-drawer-close:justify-center">
            <CiLogout size={16} />
            <span className="is-drawer-close:hidden">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
