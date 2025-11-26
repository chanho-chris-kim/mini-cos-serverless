// Layout.tsx
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import { useUserStore } from "../lib/store";

export default function Layout() {
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);

  if (!user) return null;

  return (
    <div className="flex h-screen">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} onLogout={clearUser} />
        <main className="p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
