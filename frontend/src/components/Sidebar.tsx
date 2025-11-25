import { NavLink } from "react-router-dom";
import type { User } from "../lib/types";

const navByRole: Record<string, { to: string; label: string }[]> = {
  ADMIN: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/orders", label: "Orders" },
    { to: "/tasks", label: "Tasks" },
    { to: "/warehouses", label: "Warehouses" },
    { to: "/analytics", label: "Analytics" },
  ],
  OPS_MANAGER: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/orders", label: "Orders" },
    { to: "/tasks", label: "Tasks" },
    { to: "/warehouses", label: "Warehouses" },
    { to: "/analytics", label: "Analytics" },
  ],
  WAREHOUSE_MANAGER: [
    { to: "/dashboard", label: "Warehouse Overview" },
    { to: "/tasks", label: "Tasks" },
    { to: "/returns", label: "Returns" },
    { to: "/workers", label: "Workers" },
  ],
  WORKER: [
    { to: "/scan", label: "Scan" },
    { to: "/tasks", label: "My Tasks" },
  ],
  QA: [
    { to: "/returns", label: "Returns QA" },
    { to: "/tasks", label: "QA Tasks" },
  ],
  SUPPORT: [{ to: "/orders", label: "Orders" }],
  ANALYTICS: [{ to: "/analytics", label: "Analytics" }],
};

export default function Sidebar({ user }: { user: User }) {
  const nav = navByRole[user.role] ?? navByRole.OPS_MANAGER;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
      <div className="text-xl font-semibold tracking-tight mb-6">
        COS <span className="text-slate-400 text-sm font-normal">internal</span>
      </div>
      <div className="space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm ${
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="mt-auto pt-4 text-xs text-slate-500">
        Role: {user.role}
        {user.warehouseId && <div>WH: {user.warehouseId}</div>}
      </div>
    </aside>
  );
}
