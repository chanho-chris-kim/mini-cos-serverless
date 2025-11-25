import { useState } from "react";
import { mockUsers } from "../lib/mockData";
import type { User } from "../lib/types";

export default function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [selected, setSelected] = useState(mockUsers[0].id);
  return (
    <div className="h-full grid place-items-center bg-slate-50">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold">COS Login</h1>
        <p className="text-sm text-slate-500 mt-1">
          Demo auth — pick a role to preview UI.
        </p>

        <label className="block text-xs text-slate-600 mt-4 mb-1">User</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          {mockUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} — {u.role}
            </option>
          ))}
        </select>

        <button
          onClick={() => onLogin(mockUsers.find(u => u.id === selected)!)}
          className="w-full mt-4 bg-slate-900 text-white rounded-lg py-2 text-sm hover:bg-slate-700"
        >
          Enter COS
        </button>
      </div>
    </div>
  );
}
