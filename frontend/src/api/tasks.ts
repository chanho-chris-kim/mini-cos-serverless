import { api } from "./apiClient";
import type { Task, TaskStatus } from "../lib/types";

export async function fetchTasks(): Promise<Task[]> {
  const res = await api.get("/tasks");
  return res.data;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  await api.patch(`/tasks/${id}/status`, { status });
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}
