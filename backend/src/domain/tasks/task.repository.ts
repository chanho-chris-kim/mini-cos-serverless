// backend/src/domain/tasks/task.repository.ts
import { tasks } from "../../data/tasks";
import type { TaskEntity, TaskStatus } from "./task.model";

export class TaskRepository {
  async listTasks(): Promise<TaskEntity[]> {
    return tasks;
  }

  async listTasksForWorker(workerId: string): Promise<TaskEntity[]> {
    return tasks.filter((t) => t.workerId === workerId);
  }

  async getTask(taskId: string): Promise<TaskEntity | null> {
    return tasks.find((t) => t.id === taskId) || null;
  }

  async saveTask(task: TaskEntity): Promise<void> {
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx === -1) {
      tasks.push(task);
    } else {
      tasks[idx] = task;
    }
  }

  async updateStatus(taskId: string, newStatus: TaskStatus): Promise<TaskEntity> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error("Task not found");
    task.status = newStatus;
    await this.saveTask(task);
    return task;
  }

  async assignWorker(taskId: string, workerId: string): Promise<TaskEntity> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error("Task not found");
    task.workerId = workerId;
    task.status = "IN_PROGRESS";
    await this.saveTask(task);
    return task;
  }

  seedIfEmpty() {
    if (tasks.length > 0) return;
    // You could push default tasks here if needed.
  }
}
