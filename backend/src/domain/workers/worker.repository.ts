import type { WorkerEntity } from "./worker.model";

let workers: WorkerEntity[] = [];

export class WorkerRepository {
  private rrCursors: Record<string, number> = {};

  listWorkers(): WorkerEntity[] {
    return workers;
  }

  listByWarehouse(warehouseId: string): WorkerEntity[] {
    return workers.filter((w) => w.warehouseId === warehouseId);
  }

  getWorkersByWarehouse(warehouseId: string): WorkerEntity[] {
    return this.listByWarehouse(warehouseId);
  }

  listByRole(role: WorkerEntity["role"]): WorkerEntity[] {
    return workers.filter((w) => w.role === role);
  }

  findById(id: string): WorkerEntity | null {
    return workers.find((w) => w.id === id) || null;
  }

  save(worker: WorkerEntity): void {
    worker.currentLoad =
      worker.currentLoad ?? worker.currentTasks ?? 0;
    worker.currentTasks = worker.currentLoad;
    worker.capacity = worker.capacity ?? worker.maxTasks ?? 0;
    worker.maxTasks = worker.capacity;
    worker.active = worker.active ?? true;
    worker.lastAssignedAt = worker.lastAssignedAt ?? 0;

    const idx = workers.findIndex((w) => w.id === worker.id);
    if (idx === -1) workers.push(worker);
    else workers[idx] = { ...workers[idx], ...worker };
  }

  assignTask(workerId: string, taskId: string): void {
    const worker = this.findById(workerId);
    if (!worker) return;

    worker.activeTaskIds = worker.activeTaskIds ?? [];
    if (!worker.activeTaskIds.includes(taskId)) {
      worker.activeTaskIds.push(taskId);
    }
    worker.currentLoad = worker.currentLoad ?? 0;
    worker.currentTasks = worker.currentLoad;
    this.save(worker);
  }

  seedIfEmpty(defaults: WorkerEntity[] = []): void {
    // Ensure defaults is always iterable
    if (!Array.isArray(defaults)) return;

    if (workers.length === 0) {
      workers = [...defaults];
    }
  }

  updateWorkerLoad(workerId: string, delta: number) {
    const worker = this.findById(workerId);
    if (worker) {
      worker.currentLoad = (worker.currentLoad ?? 0) + delta;
      if (worker.currentLoad < 0) worker.currentLoad = 0;
      worker.currentTasks = worker.currentLoad;
      this.save(worker);
    }
  }

  getAvailableWorkers(warehouseId: string): WorkerEntity[] {
    return workers
      .filter(
        (w) =>
          w.warehouseId === warehouseId &&
          w.active &&
          (w.capacity ?? w.maxTasks ?? 0) > (w.currentLoad ?? 0)
      )
      .sort((a, b) => {
        const loadA = a.currentLoad ?? 0;
        const loadB = b.currentLoad ?? 0;
        if (loadA !== loadB) return loadA - loadB;
        return (a.lastAssignedAt ?? 0) - (b.lastAssignedAt ?? 0);
      });
  }

  pickNextWorkerForTask(
    warehouseId: string,
    taskType: "PICK" | "PACK" | "SHIP"
  ): WorkerEntity | null {
    const zone =
      taskType === "PICK"
        ? "PICKING"
        : taskType === "PACK"
        ? "PACKING"
        : "SHIPPING";

    const eligible = workers.filter(
      (w) =>
        w.warehouseId === warehouseId &&
        w.active !== false &&
        w.zone === zone &&
        (w.capacity ?? w.maxTasks ?? 0) > (w.currentLoad ?? w.currentTasks ?? 0)
    );

    if (eligible.length === 0) return null;

    const key = `${warehouseId}:${zone}`;
    const cursor = this.rrCursors[key] ?? 0;
    const idx = cursor % eligible.length;
    const chosen = eligible[idx];
    this.rrCursors[key] = (idx + 1) % eligible.length;

    chosen.lastAssignedAt = Date.now();
    this.updateWorkerLoad(chosen.id, +1);
    this.save(chosen);

    return chosen;
  }
}
