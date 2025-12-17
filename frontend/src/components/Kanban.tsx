import type { Task } from "../lib/types";
import Badge from "./Badge";

const columns: Task["status"][] = ["PENDING_PICK", "IN_PROGRESS", "DONE", "FAILED"];

const typeStyles: Record<Task["type"], string> = {
  PICK: "bg-blue-100 text-blue-700 border border-blue-200",
  PACK: "bg-amber-100 text-amber-800 border border-amber-200",
  SHIP: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  QA: "bg-purple-100 text-purple-800 border border-purple-200",
  REFURBISH: "bg-slate-100 text-slate-700 border border-slate-200",
};

export default function Kanban({ tasks }: { tasks: Task[] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {columns.map((col) => (
        <div key={col} className="bg-slate-100 rounded-2xl p-3 min-h-[300px]">
          <div className="text-xs font-semibold mb-2">{col}</div>
          <div className="space-y-2">
            {tasks.filter((t) => t.status === col).map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className={`text-[11px] px-2 py-1 rounded-full font-semibold ${typeStyles[t.type] ?? "bg-slate-100 text-slate-700"}`}>
                    {t.type}
                  </div>
                  <Badge>{t.boxId}</Badge>
                </div>
                <div className="text-xs text-slate-600 mt-1">Type: {t.type}</div>
                <div className="text-xs text-slate-500">Box: {t.boxId}</div>
                <div className="text-xs text-slate-500">WH: {t.warehouseId} • Created: {t.createdAt ?? "-"}</div>
                {t.workerId && (
                  <div className="text-xs text-slate-500">Worker: {t.workerId}</div>
                )}
                {t.status === "IN_PROGRESS" && (
                  <div className="text-[11px] text-amber-600 font-semibold mt-1">Scanning...</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
