// Layout.tsx
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import { useUserStore } from "../lib/store";

import SimulatorPanel from "../simulator/ui/SimulatorPanel";

export default function Layout() {
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);

  if (!user) return null;

  const canSimulate =
    user.role === "ADMIN" || user.role === "OPS_MANAGER";

  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Topbar user={user} onLogout={clearUser} />
        <main className="p-4 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ⭐ Simulator (ADMIN + OPS only) */}
      {canSimulate && (
        <div className="pointer-events-auto select-none z-50">
          <SimulatorPanel />
        </div>
      )}
    </div>
  );
}
