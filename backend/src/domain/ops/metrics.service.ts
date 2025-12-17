import { orderRepo, taskRepo, warehouseRepo, backorderRepo, workerRepo } from "../sharedRepos";
import type { BackorderSummary, WarehouseOpsSnapshot } from "../../types";

const STUCK_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
const WINDOW_MS = 60 * 1000; // 1 minute for throughput

export class OpsMetricsService {
  computeOrdersByStatus() {
    const result: Record<string, number> = {};
    for (const o of orderRepo.listOrders()) {
      result[o.status] = (result[o.status] ?? 0) + 1;
    }
    return result;
  }

  computeTasksByStatus() {
    return {};
  }

  async computeSummary(now: number) {
    const orders = orderRepo.listOrders();
    const tasks = await taskRepo.listTasks();
    const backorders = backorderRepo.listByWarehouse("ALL" as any).length;
    const activeOrders = orders.length;
    const activeTasks = tasks.filter((t) => t.status !== "DONE").length;

    const ordersByStatus: Record<string, number> = {};
    for (const o of orders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    }

    const tasksByStatus: Record<string, number> = {};
    for (const t of tasks) {
      tasksByStatus[t.status] = (tasksByStatus[t.status] ?? 0) + 1;
    }

    const warehouseSummaries = warehouseRepo.listWarehouses().map((w) => {
      const activeTasksForWh = tasks.filter((t) => t.warehouseId === w.id && t.status !== "DONE").length;
      const capacity =
        workerRepo
          .getWorkersByWarehouse(w.id)
          ?.reduce((sum: number, wk: any) => sum + (wk.capacity ?? wk.maxTasks ?? 0), 0) ?? 0;
      const utilization = capacity === 0 ? 0 : activeTasksForWh / capacity;
      const lowInventory = warehouseRepo
        .getLowStock()
        .some((it) => it.warehouseId === w.id);
      const backordersForWh = backorderRepo.listByWarehouse(w.id).length;
      return {
        id: w.id,
        name: w.name,
        activeTasks: activeTasksForWh,
        capacity,
        utilization,
        backorders: backordersForWh,
        lowInventory,
      };
    });

    const oneMinuteAgo = now - WINDOW_MS;
    const ordersPerMin =
      orders.filter((o) => new Date(o.createdAt).getTime() >= oneMinuteAgo).length;
    const tasksPerMin = tasks.filter((t) => {
      const ts = t.createdAt ? new Date(t.createdAt).getTime() : 0;
      return ts >= oneMinuteAgo;
    }).length;
    const scansPerMin = tasksPerMin; // proxy

    return {
      activeOrders,
      activeTasks,
      ordersByStatus,
      tasksByStatus,
      backorders,
      warehouses: warehouseSummaries,
      throughput: {
        ordersPerMin,
        tasksPerMin,
        scansPerMin,
      },
    };
  }

  async detectStuckTasks(now: number) {
    const tasks = await taskRepo.listTasks();
    return tasks.filter(
      (t) =>
        t.status === "IN_PROGRESS" &&
        (t.createdAt ? new Date(t.createdAt).getTime() : 0) <= now - STUCK_THRESHOLD_MS
    );
  }

  detectLowInventory() {
    return warehouseRepo.getLowStock();
  }

  getBackorderSummary(now: number): BackorderSummary {
    const open = backorderRepo.listOpen();
    const totalOpenBackorders = open.length;
    const totalBackorderedUnits = open.reduce((sum, b) => sum + (b.requestedQty ?? 0), 0);
    const oldest = open.reduce<number | null>((acc, b) => {
      const age = now - new Date(b.createdAt).getTime();
      const mins = age / (60 * 1000);
      if (acc === null || mins > acc) return mins;
      return acc;
    }, null);

    const byWarehouse: BackorderSummary["byWarehouse"] = {};
    for (const b of open) {
      const wh = b.warehouseId;
      byWarehouse[wh] = byWarehouse[wh] || {
        openCount: 0,
        openUnits: 0,
        oldestOpenAgeMinutes: null,
      };
      byWarehouse[wh].openCount += 1;
      byWarehouse[wh].openUnits += b.requestedQty ?? 0;
      const mins = (now - new Date(b.createdAt).getTime()) / (60 * 1000);
      if (
        byWarehouse[wh].oldestOpenAgeMinutes === null ||
        mins > (byWarehouse[wh].oldestOpenAgeMinutes as number)
      ) {
        byWarehouse[wh].oldestOpenAgeMinutes = mins;
      }
    }

    return {
      totalOpenBackorders,
      totalBackorderedUnits,
      oldestOpenBackorderAgeMinutes: oldest,
      byWarehouse,
    };
  }

  async getWarehouseOpsSnapshot(warehouseId: string, now: number): Promise<WarehouseOpsSnapshot> {
    const tasks = await taskRepo.listTasks();
    const activeTasksForWh = tasks.filter((t) => t.warehouseId === warehouseId && t.status !== "DONE")
      .length;
    const capacity =
      workerRepo
        .getWorkersByWarehouse(warehouseId)
        ?.reduce((sum: number, wk: any) => sum + (wk.capacity ?? wk.maxTasks ?? 0), 0) ?? 0;
    const utilization = capacity === 0 ? 0 : activeTasksForWh / capacity;

    const openBackorders = backorderRepo.listOpenByWarehouse(warehouseId);
    const openBackorderedUnits = openBackorders.reduce(
      (sum, b) => sum + (b.requestedQty ?? 0),
      0
    );
    const oldestBackorderAgeMinutes =
      openBackorders.length === 0
        ? null
        : Math.max(
            ...openBackorders.map(
              (b) => (now - new Date(b.createdAt).getTime()) / (60 * 1000)
            )
          );

    const wh = warehouseRepo.findById(warehouseId);

    return {
      warehouseId,
      warehouseName: wh?.name,
      activeTasks: activeTasksForWh,
      capacity,
      utilization,
      openBackorders: openBackorders.length,
      openBackorderedUnits,
      oldestBackorderAgeMinutes,
    };
  }
}
