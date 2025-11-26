import { NavLink } from "react-router-dom";
import { useUserStore } from "../lib/store";
import { canAccess } from "../lib/permissions";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/orders", label: "Orders" },
  { to: "/tasks", label: "Tasks" },
  { to: "/scan", label: "Scan" },
  { to: "/returns", label: "Returns" },
  { to: "/warehouses", label: "Warehouses" },
  { to: "/workers", label: "Workers" },
  { to: "/analytics", label: "Analytics" },
];

export default function Sidebar() {
  const user = useUserStore((s) => s.user);

  return (
    <aside className="w-48 border-r border-slate-200 p-4 space-y-2">
      {links.map((link) =>
        user && canAccess(user, link.to) ? (
          <NavLink
            key={link.to}
            to={link.to}
            className="block py-1 text-sm text-slate-700 hover:text-black"
          >
            {link.label}
          </NavLink>
        ) : null
      )}
    </aside>
  );
}
