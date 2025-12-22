import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { WorkerEntity } from "./worker.model";
import { dynamo } from "../../lib/dynamo";
import { waitForPromise } from "../../lib/sync";

const DEFAULT_TABLE = "MiniCosWorkers";

export class DynamoWorkerRepo {
  private tableName = process.env.WORKERS_TABLE || DEFAULT_TABLE;
  private rrCursors: Record<string, number> = {};

  listWorkers(): WorkerEntity[] {
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName }))
    );
    return (res.Items as WorkerEntity[]) ?? [];
  }

  listByWarehouse(warehouseId: string): WorkerEntity[] {
    return this.listWorkers().filter((w) => w.warehouseId === warehouseId);
  }

  getWorkersByWarehouse(warehouseId: string): WorkerEntity[] {
    return this.listByWarehouse(warehouseId);
  }

  listByRole(role: WorkerEntity["role"]): WorkerEntity[] {
    return this.listWorkers().filter((w) => w.role === role);
  }

  findById(id: string): WorkerEntity | null {
    const res = waitForPromise(
      dynamo.send(new GetCommand({ TableName: this.tableName, Key: { id } }))
    );
    return (res.Item as WorkerEntity) ?? null;
  }

  save(worker: WorkerEntity): void {
    worker.currentLoad = worker.currentLoad ?? worker.currentTasks ?? 0;
    worker.currentTasks = worker.currentLoad;
    worker.capacity = worker.capacity ?? worker.maxTasks ?? 0;
    worker.maxTasks = worker.capacity;
    worker.active = worker.active ?? true;
    worker.lastAssignedAt = worker.lastAssignedAt ?? 0;

    waitForPromise(
      dynamo.send(new PutCommand({ TableName: this.tableName, Item: worker }))
    );
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
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName, Limit: 1 }))
    );
    if ((res.Items?.length ?? 0) === 0 && defaults.length > 0) {
      defaults.forEach((w) => this.save(w));
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
    return this.listWorkers()
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

    const eligible = this.listWorkers().filter(
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
