// backend/src/api/controllers/analytics.controller.ts
import type { Request, Response } from "express";
import { orderRepo, taskRepo, warehouseRepo, workerRepo } from "../../domain/sharedRepos";
import { MetricsService } from "../../domain/metrics/metrics.service";
import type { SlaMetrics, ReturnMetrics } from "../../types";

const metricsService = new MetricsService();

/** --------------------------------
 * GET /analytics/overview
 * -------------------------------- */
export const getOverview = async (_req: Request, res: Response) => {
  try {
    const orders = orderRepo.listOrders();
    const tasks = await taskRepo.listTasks();
    const workers = workerRepo.listWorkers();
    const warehouses = warehouseRepo.listWarehouses();

    const orderCountsByStatus: Record<string, number> = {};
    for (const o of orders) {
      orderCountsByStatus[o.status] = (orderCountsByStatus[o.status] || 0) + 1;
    }

    const taskCountsByStatus: Record<string, number> = {};
    const taskCountsByType: Record<string, number> = {};
    for (const t of tasks) {
      taskCountsByStatus[t.status] = (taskCountsByStatus[t.status] || 0) + 1;
      taskCountsByType[t.type] = (taskCountsByType[t.type] || 0) + 1;
    }

    const warehouseLoad = warehouses.map((w) => {
      const activeTasks = tasks.filter(
        (t) => t.warehouseId === w.id && t.status !== "DONE"
      ).length;
      const utilization = w.dailyCapacity
        ? activeTasks / w.dailyCapacity
        : 0;
      return {
        id: w.id,
        name: w.name,
        activeTasks,
        capacity: w.dailyCapacity,
        utilization,
      };
    });

    const workerUtilization = workers.map((w) => {
      const utilization = w.maxTasks ? w.currentTasks / w.maxTasks : 0;
      return {
        id: w.id,
        name: w.name,
        warehouseId: w.warehouseId,
        currentTasks: w.currentTasks,
        maxTasks: w.maxTasks,
        utilization,
      };
    });

    const lowStock = warehouseRepo.getLowStock();

    res.json({
      orders: { total: orders.length, byStatus: orderCountsByStatus },
      tasks: { total: tasks.length, byStatus: taskCountsByStatus, byType: taskCountsByType },
      warehouses: { load: warehouseLoad, lowStock },
      workers: { utilization: workerUtilization },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /analytics/orders-status
 * -------------------------------- */
export const getOrdersByStatus = async (_req: Request, res: Response) => {
  try {
    const orders = await orderRepo.listOrders();

    const grouped: Record<string, number> = {};
    for (const o of orders) {
      grouped[o.status] = (grouped[o.status] || 0) + 1;
    }

    res.json(grouped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /analytics/tasks-status
 * -------------------------------- */
export const getTasksByStatus = async (_req: Request, res: Response) => {
  try {
    const tasks = await taskRepo.listTasks();

    const grouped: Record<string, number> = {};
    for (const t of tasks) {
      grouped[t.status] = (grouped[t.status] || 0) + 1;
    }

    res.json(grouped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /analytics/returns
 * -------------------------------- */
export const getReturnAnalytics = async (_req: Request, res: Response) => {
  try {
    const boxes = await orderRepo.listBoxes();

    const states: Record<string, number> = {};
    const categories: Record<string, number> = {};

    for (const b of boxes) {
      states[b.state] = (states[b.state] || 0) + 1;

      if (b.returnCategory) {
        categories[b.returnCategory] =
          (categories[b.returnCategory] || 0) + 1;
      }
    }

    res.json({ states, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /analytics/low-stock
 * -------------------------------- */
export const getLowStock = (_req: Request, res: Response) => {
  try {
    const low = warehouseRepo.getLowStock();
    res.json(low);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSlaMetrics = async (_req: Request, res: Response) => {
  try {
    const sla: SlaMetrics = await metricsService.getSlaMetrics();
    res.json({ sla });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getReturnMetrics = async (_req: Request, res: Response) => {
  try {
    const returns: ReturnMetrics = await metricsService.getReturnMetrics();
    res.json({ returns });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
