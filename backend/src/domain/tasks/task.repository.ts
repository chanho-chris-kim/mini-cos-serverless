// backend/src/domain/tasks/task.repository.ts
import type { TaskEntity, TaskStatus } from "./task.model";
import { orderRepo, warehouseRepo } from "../sharedRepos";

// In-memory task store for now
let tasks: TaskEntity[] = [];

export class TaskRepository {
  // Always return a fresh array so callers can't mutate the internal store by accident
  async listTasks(): Promise<TaskEntity[]> {
    return [...tasks];
  }

  async countActiveTasksForWarehouse(warehouseId: string): Promise<number> {
    return tasks.filter(
      (t) => t.warehouseId === warehouseId && t.status !== "DONE"
    ).length;
  }

  async listTasksForWorker(workerId: string): Promise<TaskEntity[]> {
    return tasks.filter((t) => t.workerId === workerId);
  }

  async getTask(taskId: string): Promise<TaskEntity | null> {
    return tasks.find((t) => t.id === taskId) ?? null;
  }

  async saveTask(task: TaskEntity): Promise<void> {
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx === -1) {
      tasks.push(task);
    } else {
      tasks[idx] = task;
    }
  }

  async createTask(task: TaskEntity): Promise<TaskEntity> {
    await this.saveTask(task);
    return task;
  }

  async upsertMany(newTasks: TaskEntity[]): Promise<void> {
    for (const t of newTasks) {
      const idx = tasks.findIndex((x) => x.id === t.id);
      if (idx === -1) tasks.push(t);
      else tasks[idx] = t;
    }
  }

  async updateTaskStatus(
    taskId: string,
    newStatus: TaskStatus
  ): Promise<TaskEntity> {
    return this.updateStatus(taskId, newStatus);
  }

  async updateStatus(
    taskId: string,
    newStatus: TaskStatus
  ): Promise<TaskEntity> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error("Task not found");

    const prevStatus = task.status;
    task.status = newStatus;
    await this.saveTask(task);

    await this.updateBoxStateForTask(task, newStatus);
    return task;
  }

  async assignWorker(taskId: string, workerId: string): Promise<TaskEntity> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error("Task not found");

    task.workerId = workerId;

    // If it was pending, move to in-progress and sync box state
    if (task.status === "PENDING_PICK") {
      return this.updateStatus(task.id, "IN_PROGRESS");
    }

    await this.saveTask(task);
    return task;
  }

  seedIfEmpty(defaults: TaskEntity[] = []): void {
    if (!Array.isArray(defaults)) return;
    if (tasks.length === 0 && defaults.length) {
      tasks = [...defaults];
    }
  }

  // Optional helper for analytics / debugging
  async countByStatus(): Promise<Record<TaskStatus, number>> {
    const result = {} as Record<TaskStatus, number>;
    for (const t of tasks) {
      result[t.status] = (result[t.status] ?? 0) + 1;
    }
    return result;
  }

  private async updateBoxStateForTask(task: TaskEntity, status: TaskStatus) {
    const order = orderRepo.findById(task.orderId);
    if (!order) return;

    const box = order.boxes.find((b) => b.id === task.boxId);
    if (!box) return;

    console.log("[TASK STATUS]", task.id, task.type, "→", status, "for box", task.boxId);

    if (status === "IN_PROGRESS") {
      box.state = "PICK_ASSIGNED";
    } else if (status === "DONE") {
      if (task.type === "PICK" || !task.type) box.state = "PICKED";
      else if (task.type === "PACK") box.state = "PACKED";
      else if (task.type === "SHIP") box.state = "OUTBOUND";
    }

    orderRepo.saveOrder(order);
    await orderRepo.recomputeOrderStatus(order.id);

    // Activate next stage tasks for the same box
    const tasksForBox = tasks.filter(
      (t) => t.orderId === task.orderId && t.boxId === task.boxId
    );
    if (task.type === "PICK" && status === "DONE") {
      const next = tasksForBox.find(
        (t) => t.type === "PACK" && t.status === "PENDING"
      );
      if (next) {
        next.status = "PENDING_PICK";
        this.saveTask(next);
      }
    } else if (task.type === "PACK" && status === "DONE") {
      const next = tasksForBox.find(
        (t) => t.type === "SHIP" && t.status === "PENDING"
      );
      if (next) {
        next.status = "PENDING_PICK";
        this.saveTask(next);
      }
    } else if (task.type === "SHIP" && status === "DONE") {
      // Mark box delivered
      const order2 = orderRepo.findById(task.orderId);
      if (order2) {
        const b = order2.boxes.find((bx) => bx.id === task.boxId);
        if (b) b.state = "DELIVERED";
        orderRepo.saveOrder(order2);
        await orderRepo.recomputeOrderStatus(order2.id);
      }
    }

    console.log("[BOX STATE]", box.id, "now", box.state);
  }

  private updateInventoryForTask(
    _task: TaskEntity,
    _prevStatus: TaskStatus,
    _newStatus: TaskStatus
  ) {
    // Inventory mutations handled in TaskService (Phase 4)
  }
}
