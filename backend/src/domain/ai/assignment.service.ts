// backend/src/domain/ai/assignment.service.ts
import { warehouseSeed } from "../../seed/warehouses.seed";
import { haversineDistanceKm } from "./distance";
import {
  workerRepo,
  taskRepo,
  orderRepo,
  warehouseRepo,
  backorderRepo,
} from "../sharedRepos";
import type { BoxEntity } from "../orders/box.model";
import { randomSKU } from "../../utils/skuList";
import { LOW_STOCK_THRESHOLD } from "../../config/inventoryThresholds";
import { eventLogger } from "../events/eventLogger.service";

interface AssignWarehouseInput {
  lat: number;
  lng: number;
  skuList: string[];
}

export class AssignmentService {
  private workerRepo = workerRepo;
  private taskRepo = taskRepo;
  private orderRepo = orderRepo;
  private warehouseRepo = warehouseRepo;

  /**
   * AI warehouse selection:
   * - Distance to customer
   * - Remaining capacity (dailyCapacity - active tasks)
   * - Idle workers at that warehouse
   */
  async assignWarehouse(input: AssignWarehouseInput) {
    const { lat, lng, skuList } = input;

    const repoWarehouses = this.warehouseRepo.listWarehouses();
    const pool = repoWarehouses.length > 0 ? repoWarehouses : warehouseSeed;

    if (pool.length === 0) return null;

    let best: (typeof pool)[number] | null = null;
    let bestScore = -Infinity;

    for (const wh of pool) {
      // Distance score: closer warehouses get higher scores (capped).
      const distKm = haversineDistanceKm(
        lat,
        lng,
        wh.location.lat,
        wh.location.lng
      );
      const distScore = Math.max(0, 50 - distKm); // closer = higher

      // Worker score: number of idle workers * 2.
      const workers = this.workerRepo.getWorkersByWarehouse(wh.id);
      const idleWorkers = workers.filter(
        (w) => (w.currentLoad ?? w.currentTasks ?? 0) < (w.capacity ?? w.maxTasks ?? 0) && w.active !== false
      ).length;
      const workerScore = idleWorkers * 2;

      // Load score: remaining capacity from daily capacity minus active tasks.
      const activeTasks = await this.taskRepo.countActiveTasksForWarehouse(
        wh.id
      );
      const remainingCapacity = Math.max(0, wh.dailyCapacity - activeTasks);
      const loadScore = remainingCapacity / 50;

      // Coverage score: number of requested SKUs with stock > 0 * weight.
      const coverageCount = skuList.reduce((count, sku) => {
        const stock = wh.inventory?.[sku] ?? 0;
        return stock > 0 ? count + 1 : count;
      }, 0);
      const coverageScore = coverageCount * 10;

      const total = distScore + workerScore + loadScore + coverageScore;

      if (total > bestScore) {
        bestScore = total;
        best = wh;
      }
    }

    return best;
  }

  /**
   * For a given order+warehouse, create PICK tasks for each box.
   */
  async generateTasksForWarehouse(
    orderId: string,
    warehouseId: string,
    boxes: Array<{ id: string; sku?: string }>
  ) {
    const createdAt = new Date().toISOString();
    const createdTasks = [];

    const repoWarehouse = this.warehouseRepo.findById(warehouseId);
    const wh =
      repoWarehouse ??
      warehouseSeed.find((w) => w.id === warehouseId);

    for (const box of boxes) {
      console.log("---- TASK GEN START ----");
      console.log("Order:", orderId);
      console.log("Box:", box.id, "SKU:", box.sku);
      console.log("Warehouse:", warehouseId);
      console.log("Warehouse inventory snapshot:", wh?.inventory);
      console.log("Stock for SKU:", wh?.inventory?.[box.sku ?? "UNKNOWN"]);
      console.log("------------------------");

      // Skip task creation if warehouse has no stock for the SKU
      const stock = wh?.inventory?.[box.sku ?? "UNKNOWN"] ?? 0;
      if (stock <= LOW_STOCK_THRESHOLD) {
        console.log(
          `[LOW STOCK WARNING] SKU ${box.sku} has only ${stock} items left in ${warehouseId}`
        );
      }
      if (stock <= 0) {
        console.log("[TASK GEN] skipping box", box.id, "sku", box.sku, "no stock in", warehouseId);
        backorderRepo.add({
          warehouseId,
          orderId,
          boxId: box.id,
          sku: box.sku ?? "UNKNOWN",
          requestedQty: 1,
          createdAt: new Date().toISOString(),
          reason: "INSUFFICIENT_STOCK",
        });
        eventLogger.log(
          warehouseId,
          "BACKORDER_CREATED",
          `Backorder for order ${orderId} box ${box.id} sku ${box.sku}`,
          { orderId, boxId: box.id, sku: box.sku }
        );
        continue;
      }

      console.log("✅ Creating PICK/PACK/SHIP for box:", box.id);

      const pick = await this.taskRepo.createTask({
        id: `T-${orderId}-${box.id}-1`,
        orderId,
        boxId: box.id,
        warehouseId,
        workerId: null,
        status: "PENDING_PICK",
        type: "PICK",
        createdAt,
      });
      const pack = await this.taskRepo.createTask({
        id: `T-${orderId}-${box.id}-2`,
        orderId,
        boxId: box.id,
        warehouseId,
        workerId: null,
        status: "PENDING",
        type: "PACK",
        createdAt,
      });
      const ship = await this.taskRepo.createTask({
        id: `T-${orderId}-${box.id}-3`,
        orderId,
        boxId: box.id,
        warehouseId,
        workerId: null,
        status: "PENDING",
        type: "SHIP",
        createdAt,
      });
      createdTasks.push(pick, pack, ship);
      eventLogger.log(
        warehouseId,
        "TASK_CREATED",
        `Tasks created for order ${orderId} box ${box.id}`,
        { orderId, boxId: box.id }
      );

      // Decrement inventory for the SKU when tasks are created
      if (wh && box.sku && wh.inventory?.[box.sku] != null) {
        wh.inventory[box.sku] = Math.max(0, (wh.inventory[box.sku] ?? 0) - 1);
      }
    }

    console.log("[TASK GEN] created", createdTasks.length, "tasks for order", orderId, "at warehouse", warehouseId);
    return createdTasks;
  }

  /**
   * Auto-assign all PENDING_PICK tasks using round-robin per warehouse/zone.
   * Moves assigned tasks to IN_PROGRESS. PACK/SHIP tasks are created but not auto-assigned here.
   */
  async autoAssignTasks() {
    const tasks = (await this.taskRepo.listTasks()).filter(
      (t) => t.status === "PENDING_PICK"
    );
    if (tasks.length === 0) return [];

    const assignments: Array<{ taskId: string; workerId: string; workerName?: string }> = [];

    for (const t of tasks) {
      const chosen = this.workerRepo.pickNextWorkerForTask(
        t.warehouseId,
        t.type as any
      );

      if (!chosen) continue;

      this.workerRepo.assignTask(chosen.id, t.id);

      t.workerId = chosen.id;
      t.status = "IN_PROGRESS";
      await this.taskRepo.saveTask(t);
      assignments.push({ taskId: t.id, workerId: chosen.id, workerName: chosen.name });
      eventLogger.log(
        t.warehouseId,
        "TASK_ASSIGNED",
        `Task ${t.id} assigned to worker ${chosen.id}`,
        { taskId: t.id, workerId: chosen.id }
      );
    }

    return assignments;
  }

  /**
   * Used by simulator / integrations:
   * - Pick a warehouse
   * - Create boxes
   * - Save order
   * - Generate tasks
   * - Auto-assign workers
   */
  async createIncomingOrder(payload: {
    orderId?: string;
    customerName?: string;
    destination: { lat: number; lng: number };
    boxes: Array<{ id: string; sku?: string }>;
  }) {
    const orderId = payload.orderId ?? `SIM-${Date.now()}`;

    const incomingBoxes =
      payload.boxes && payload.boxes.length > 0
        ? payload.boxes
        : Array.from({
            length: Math.max(1, Math.floor(Math.random() * 3) + 1),
          }).map((_v, idx) => ({
            id: `${orderId}-BOX-${idx + 1}`,
            sku: randomSKU(),
          }));

    const warehouse = await this.assignWarehouse({
      lat: payload.destination.lat,
      lng: payload.destination.lng,
      skuList: incomingBoxes.map((b) => b.sku ?? "UNKNOWN"),
    });

    if (!warehouse) throw new Error("No available warehouse");

    const boxes: BoxEntity[] = incomingBoxes.map((b) => ({
      id: b.id,
      orderId,
      sku: b.sku!,
      warehouseId: warehouse.id,
      state: "PENDING",
    }));

    const order = {
      id: orderId,
      customerId: "SIM-CUST",
      customerName: payload.customerName ?? "Simulator",
      createdAt: new Date().toISOString(),
      status: "PENDING",
      routes: {
        [warehouse.id]: boxes.map((b) => b.id),
      },
      boxes,
    };

    this.orderRepo.saveOrder(order);
    console.log("[SIM ORDER]", order.id, "boxes", boxes.map((b) => b.sku), "warehouse", warehouse.id);

    const tasks = await this.generateTasksForWarehouse(orderId, warehouse.id, boxes);
    console.log("[SIM TASKS CREATED]", tasks.length, "for order", orderId);
    await this.autoAssignTasks();

    return { order, warehouse };
  }
}
