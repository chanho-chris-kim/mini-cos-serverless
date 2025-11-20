import axios from "axios";
import type { Task, TaskStatus } from "../types";

const BASE_URL = "http://localhost:3000/tasks";

/**
 * Fetch all warehouse tasks
 */
export async function fetchTasks(): Promise<Task[]> {
  const res = await axios.get(BASE_URL);
  return res.data;
}

/**
 * Trigger automatic assignment of tasks
 */
export async function assignTasks(): Promise<void> {
  await axios.post(`${BASE_URL}/assign`);
}

/**
 * Update the status of a specific task
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  await axios.patch(`${BASE_URL}/${taskId}`, { status });
}

/**
 * Delete a specific task
 */
export async function deleteTask(taskId: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${taskId}`);
}
