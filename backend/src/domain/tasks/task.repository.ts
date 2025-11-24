import { tasks } from "../../data/tasks";
import type { TaskEntity } from "./task.model";

export class TaskRepository {
  getAll(): TaskEntity[] {
    return tasks;
  }

  getById(id: string): TaskEntity | undefined {
    return tasks.find((t) => t.id === id);
  }

  save(task: TaskEntity): TaskEntity {
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index === -1) {
      tasks.push(task);
    } else {
      tasks[index] = task;
    }
    return task;
  }

  getPending(): TaskEntity[] {
    return tasks.filter((t) => t.status === "PENDING");
  }

  removeByOrderId(orderId: string): void {
    tasks.forEach((t, idx) => {
      if (t.orderId === orderId) {
        tasks[idx] = { ...t, status: "DELETED_ORDER" };
      }
    });
  }

  delete(id: string): boolean {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  }
}
