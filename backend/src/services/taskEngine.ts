import { inMemoryTasks } from "../data/tasks";
import type { Task, TaskStatus, Order } from "../types";
import { assignTasksToWorkers } from "./aiAgent";

// Get all tasks as an array
export function getAllTasks(): Task[] {
  return Object.values(inMemoryTasks);
}

// Enqueue tasks for a new order
export async function enqueueTasksForOrder(order: Order): Promise<Task[]> {
  const tasks: Task[] = order.items.map((it, idx) => {
    const task: Task = {
      id: `${order.id}-t-${idx}`,
      type: "PICK",
      sku: it.sku,
      qty: it.qty,
      orderId: order.id,
      status: "PENDING",
      order,
      worker: "",
    };
    inMemoryTasks[task.id] = task;
    return task;
  });

  return tasks;
}

// Assign tasks to workers
export async function assignTasks(tasks: Task[], workers: any[]): Promise<Task[]> {
  const assigned = assignTasksToWorkers(tasks, workers);

  assigned.forEach((t) => {
    t.status = "ASSIGNED";
    inMemoryTasks[t.id] = t;
  });

  return assigned.map((t) => ({ ...t, worker: t.assignedTo || "" }));
}

// Update task status
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  const task = inMemoryTasks[taskId];
  if (!task) throw new Error("Task not found");

  task.status = status;
  return task;
}

// Delete a task completely
export async function deleteTask(taskId: string): Promise<Task> {
  const task = inMemoryTasks[taskId];
  if (!task) throw new Error("Task not found");

  delete inMemoryTasks[taskId];
  return task;
}

// Mark all tasks for a deleted order as DELETED_ORDER
export async function markTasksForDeletedOrder(orderId: string): Promise<number> {
  let count = 0;
  Object.values(inMemoryTasks).forEach((task) => {
    if (task.orderId === orderId) {
      task.status = "DELETED_ORDER";
      count++;
    }
  });
  return count; // return number of tasks updated
}
