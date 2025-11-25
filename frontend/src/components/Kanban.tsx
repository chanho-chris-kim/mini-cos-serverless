import type { Task } from "../lib/types";
import Badge from "./Badge";

const columns: Task["status"][] = ["PENDING", "IN_PROGRESS", "DONE", "FAILED"];

export default function Kanban({ tasks }: { tasks: Task[] }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {columns.map((col) => (
        <div key={col} className="bg-slate-100 rounded-2xl p-3 min-h-[300px]">
          <div className="text-xs font-semibold mb-2">{col}</div>
          <div className="space-y-2">
            {tasks.filter((t) => t.status === col).map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{t.type}</div>
                  <Badge>{t.boxId}</Badge>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  WH: {t.warehouseId} • Due: {t.dueAt}
                </div>
                {t.assignedTo && (
                  <div className="text-xs text-slate-500 mt-1">Assigned: {t.assignedTo}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
