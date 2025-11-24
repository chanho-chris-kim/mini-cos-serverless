import { warehouses } from "../../data/warehouses";
import { workers } from "../../data/workers";
import { TaskRepository } from "../tasks/task.repository";
import type { TaskEntity } from "../tasks/task.model";
import { distanceKm } from "./distance";
import { customers } from "../../data/customers";

export class AssignmentService {
  private taskRepo = new TaskRepository();

  assignPendingTasks(): TaskEntity[] {
    const warehouse = warehouses[0];
    if (!warehouse) {
      return this.taskRepo.getAll();
    }

    const pending = this.taskRepo.getPending();

    pending.forEach((task) => {
      const customer =
        customers.find((c) => c.id === task.order?.customer.id) ??
        task.order?.customer;
      if (!customer) return;

      const addr = customer.deliveryAddress ?? customer.homeAddress;
      if (!addr) return;

      const availableWorkers = workers.filter(
        (w) => w.currentTasks < w.maxTasks
      );

      if (availableWorkers.length === 0) return;

      const scored = availableWorkers
        .map((w) => {
          const d = distanceKm(
            warehouse.location.lat,
            warehouse.location.lng,
            addr.lat,
            addr.lng
          );
          return {
            worker: w,
            score: d + w.currentTasks * 2,
          };
        })
        .sort((a, b) => a.score - b.score);

      const best = scored[0]?.worker;
      if (!best) return;

      task.worker = best.name;
      task.status = "ASSIGNED";
      best.currentTasks++;
      this.taskRepo.save(task);
    });

    return this.taskRepo.getAll();
  }
}
