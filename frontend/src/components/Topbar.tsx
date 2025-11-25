import type { User } from "../lib/types";

export default function Topbar({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
      <div className="text-sm text-slate-600">Cozey Operating System • Post-Purchase Ops</div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">{user.name}</div>
        <button
          onClick={onLogout}
          className="text-xs px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
