import type { Task } from "../../types";
import * as TasksAPI from "../../api/tasks";
import { useState } from "react";

interface Props {
  tasks: Task[];
  onTasksUpdated: () => void;
}

export default function TasksTable({ tasks, onTasksUpdated }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    await TasksAPI.updateTaskStatus(taskId, status);
    onTasksUpdated();
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await TasksAPI.deleteTask(taskId);
      onTasksUpdated();
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };

  if (tasks.length === 0)
    return (
      <p className="text-text-secondary">
        No tasks yet — assign tasks to start workflow
      </p>
    );

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full border border-primary rounded-lg">
        <thead className="bg-primary-hover text-secondary">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium w-36">
              Task ID
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium">
              Customer
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium">Item</th>
            <th className="py-3 px-4 text-left text-sm font-medium">
              Assigned Worker
            </th>
            <th className="py-3 px-4 text-sm font-medium">Status</th>
            <th className="py-3 px-4 text-sm font-medium text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const firstItem = t.order?.items?.[0];
            return (
              <tr
                key={t.id}
                className="hover:bg-secondary-hover transition-colors duration-150 align-middle"
              > 
                <td className="py-2 px-4 border-b truncate max-w-[9rem] relative">
                  <span
                    className="cursor-pointer"
                    onClick={() => navigator.clipboard.writeText(t.id)}
                  >
                    {t.id.slice(0, 8)}...
                  </span>
                  <div className="absolute left-0 bottom-full mb-1 w-max max-w-xs bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.id} (click to copy)
                  </div>
                </td>

                <td className="py-2 px-4 border-b align-middle">
                  {t.order?.customer?.name || "-"}
                </td>
                <td className="py-2 px-4 border-b align-middle">
                  {firstItem ? `${firstItem.sku} (${firstItem.qty})` : "-"}
                </td>
                <td className="py-2 px-4 border-b align-middle">
                  {t.worker || "-"}
                </td>
                <td className="py-2 px-4 border-b align-middle">
                  <select
                    value={t.status}
                    onChange={(e) =>
                      handleStatusChange(t.id, e.target.value as Task["status"])
                    }
                    className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELED">CANCELED</option>
                    <option value="DELETED_ORDER">DELETED_ORDER</option>
                  </select>
                </td>

                {/* Delete button aligned properly */}
                <td className="py-2 px-4 border-b text-center align-middle">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="px-4 py-1 rounded-full bg-accent hover:bg-accent-hover text-secondary font-medium shadow-sm transition-colors duration-150"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
