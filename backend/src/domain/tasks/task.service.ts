// backend/src/domain/tasks/task.service.ts
import { TaskRepository } from "./task.repository";
import type { TaskStatus } from "./task.model";

const repo = new TaskRepository();

export class TaskService {
  async listTasks() {
    return repo.listTasks();
  }

  async getTasksForWorker(workerId: string) {
    return repo.listTasksForWorker(workerId);
  }

  async updateStatus(taskId: string, status: TaskStatus) {
    return repo.updateStatus(taskId, status);
  }

  async assignWorker(taskId: string, workerId: string) {
    return repo.assignWorker(taskId, workerId);
  }
}
