import type { Task, TaskStatus } from "../types";
import { API } from "./apiClient";

/**
 * Fetch all warehouse tasks
 */
export async function fetchTasks(): Promise<Task[]> {
  const res = await API.get("/tasks");
  return res.data;
}

/**
 * Trigger automatic assignment of all pending tasks
 */
export async function assignTasks(): Promise<Task[]> {
  const res = await API.post("/assign");
  return res.data;
}

/**
 * Update the status of a specific task
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<Task> {
  const res = await API.patch(`/tasks/${taskId}/status`, { status });
  return res.data;
}

/**
 * Delete a specific task (optional backend route needed)
 */
export async function deleteTask(taskId: string): Promise<void> {
  // Only works IF you add DELETE /api/tasks/:id in backend
  await API.delete(`/tasks/${taskId}`);
}
