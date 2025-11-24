import type { TaskStatus } from "../../types";
import type { TaskEntity } from "./task.model";
import { TaskRepository } from "./task.repository";

export class TaskService {
  private repo = new TaskRepository();

  getAll(): TaskEntity[] {
    return this.repo.getAll();
  }

  getPending(): TaskEntity[] {
    return this.repo.getPending();
  }

  updateStatus(id: string, status: TaskStatus): TaskEntity | undefined {
    const existing = this.repo.getById(id);
    if (!existing) return undefined;
    const updated: TaskEntity = { ...existing, status };
    return this.repo.save(updated);
  }

  assignWorker(id: string, workerName: string): TaskEntity | undefined {
    const existing = this.repo.getById(id);
    if (!existing) return undefined;
    const updated: TaskEntity = {
      ...existing,
      worker: workerName,
      status: "ASSIGNED",
    };
    return this.repo.save(updated);
  }

  delete(id: string): boolean {
    return this.repo.delete(id);
  }
}
