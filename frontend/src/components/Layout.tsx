import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { User } from "../lib/types";

export default function Layout({
  user,
  onLogout,
}: { user: User | null; onLogout: () => void }) {
  if (!user) return <Outlet />;

  return (
    <div className="h-full flex bg-slate-50 text-slate-900">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} onLogout={onLogout} />
        <main className="flex-1 p-5 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
