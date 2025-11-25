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
  });

  const assignMutation = useMutation({
    mutationFn: AssignAPI.autoAssignTasks,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const visibleTasks =
    user?.role === "WORKER"
      ? tasks.filter((t) => t.assignedTo === user.id)
      : tasks;

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

      <Kanban tasks={visibleTasks} />
    </div>
  );
}
