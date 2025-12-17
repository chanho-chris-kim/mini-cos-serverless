import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as TasksAPI from "../api/tasks";
import * as AssignAPI from "../api/assign";
import Kanban from "../components/Kanban";
import type { User } from "../lib/types";

export default function Tasks({ user }: { user: User | null }) {
  const qc = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: TasksAPI.fetchTasks,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });

  const assignMutation = useMutation({
    mutationFn: AssignAPI.autoAssignTasks,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const visibleTasks =
    user?.role === "WORKER"
      ? tasks.filter((t) => t.workerId === user.id)
      : tasks;

  const total = visibleTasks.length;
  const pickCount = visibleTasks.filter((t) => t.type === "PICK").length;
  const packCount = visibleTasks.filter((t) => t.type === "PACK").length;
  const shipCount = visibleTasks.filter((t) => t.type === "SHIP").length;
  const assignedToMe =
    user?.role === "WORKER"
      ? visibleTasks.filter((t) => t.workerId === user.id).length
      : 0;

  if (isLoading) return <div>Loading tasks...</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <div className="text-sm text-slate-500">
            {user?.role === "WORKER" ? "My tasks" : "All tasks"}
          </div>
        </div>

        {user?.role !== "WORKER" && (
          <button
            onClick={() => assignMutation.mutate()}
            className="px-3 py-2 text-sm rounded bg-slate-900 text-white hover:bg-slate-700"
          >
            Auto Assign
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-600">
        <div className="font-medium">Total tasks: {total}</div>
        <div className="text-slate-500">
          PICK: {pickCount} • PACK: {packCount} • SHIP: {shipCount}
        </div>
        {user?.role === "WORKER" && (
          <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-700 text-xs">
            Assigned to you: {assignedToMe}
          </span>
        )}
      </div>

      <Kanban tasks={visibleTasks} />
    </div>
  );
}
