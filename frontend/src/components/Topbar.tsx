import { useUserStore } from "../lib/store";

export default function Topbar() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
      <div className="text-sm text-slate-600">
        Cozey Operating System • Post-Purchase Ops
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="text-sm font-medium">{user.name}</div>
            <button
              onClick={() => setUser(null)}
              className="text-xs px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-700"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="text-sm text-slate-500">Not logged in</div>
        )}
      </div>
    </header>
  );
}
