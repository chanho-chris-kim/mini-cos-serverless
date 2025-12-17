// backend/src/domain/tasks/task.service.ts
import { taskRepo, workerRepo } from "../sharedRepos";
import type { TaskStatus } from "./task.model";
import { orderRepo, warehouseRepo } from "../sharedRepos";
import {
  reserveStock,
  consumeReservedStock,
} from "../inventory/inventory.service";
import { eventLogger } from "../events/eventLogger.service";

export class TaskService {
  async listTasks() {
    return taskRepo.listTasks();
  }

  async getTasksForWorker(workerId: string) {
    return taskRepo.listTasksForWorker(workerId);
  }

  async updateStatus(taskId: string, status: TaskStatus) {
    const task = await taskRepo.getTask(taskId);
    if (!task) throw new Error("Task not found");
    const prevStatus = task.status;

    // Inventory reservation/consumption logic
    if (task.type === "PICK" && status === "IN_PROGRESS") {
      const order = orderRepo.findById(task.orderId);
      const box = order?.boxes.find((b) => b.id === task.boxId);
      const wh = warehouseRepo.findById(task.warehouseId);
      if (!order || !box || !wh) throw new Error("Order/box/warehouse missing");

      const qty = box.reservedQty != null ? box.reservedQty : 1;
      const ok = reserveStock(wh, box.sku, qty);
      if (!ok) {
        console.warn(
          `[INV] BLOCKED: insufficient ${box.sku} in ${wh.id}`
        );
        throw new Error(`Insufficient inventory for SKU ${box.sku}`);
      }
      box.reservedQty = qty;
      orderRepo.saveOrder(order);
      console.log(
        `[INV] Reserved ${qty} ${box.sku} (remaining: ${wh.inventory[box.sku]})`
      );
    }

    if (task.type === "PACK" && status === "DONE") {
      const order = orderRepo.findById(task.orderId);
      const box = order?.boxes.find((b) => b.id === task.boxId);
      const wh = warehouseRepo.findById(task.warehouseId);
      if (order && box && wh) {
        consumeReservedStock(box, wh);
        orderRepo.saveOrder(order);
        console.log(`[INV] Consumed ${box.sku} reserved stock`);
      }
    }

    const updated = await taskRepo.updateStatus(taskId, status);

    if (prevStatus !== "DONE" && status === "DONE" && updated.workerId) {
      workerRepo.updateWorkerLoad(updated.workerId, -1);
    }
    eventLogger.log(
      updated.warehouseId,
      "TASK_UPDATED",
      `Task ${updated.id} updated to ${status}`,
      { taskId: updated.id, status }
    );

    return updated;
  }

  async assignWorker(taskId: string, workerId: string) {
    return taskRepo.assignWorker(taskId, workerId);
  }

  async completeNextInProgress() {
    const tasks = await taskRepo.listTasks();
    const next = tasks.find((t) => t.status === "IN_PROGRESS");
    if (!next) return null;
    return taskRepo.updateStatus(next.id, "DONE");
  }
}
