// backend/src/api/controllers/warehouses.controller.ts

import type { Request, Response } from "express";
import { warehouseRepo } from "../../domain/sharedRepos";
import { workerRepo, taskRepo } from "../../domain/sharedRepos";
import type { RequestWithUser } from "../../middleware/auth.middleware";
import { WarehouseWorkerActivity, WarehouseMetrics } from "../../types";
import { MetricsService } from "../../domain/metrics/metrics.service";
import { backorderRepo } from "../../domain/sharedRepos";

/** --------------------------------
 * GET /warehouses
 * -------------------------------- */
export const getWarehouses = async (_req: Request, res: Response) => {
  try {
    const warehouses = warehouseRepo.listWarehouses().map((w) => ({
      id: w.id,
      name: w.name,
      location: {
        street: (w as any).location?.street ?? (w as any).location?.line1,
        city: w.location.city,
        province: (w as any).location?.province,
        postal: w.location.postal,
        lat: w.location.lat,
        lng: w.location.lng,
      },
    }));
    res.json(warehouses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

function enforceWarehouseAccess(req: Request, warehouseId: string) {
  const user = (req as RequestWithUser).user;
  if (!user) return { ok: false, status: 401, message: "Not authenticated" };
  if (user.role === "ADMIN" || user.role === "OPS_MANAGER") return { ok: true };
  if (user.role === "WAREHOUSE_MANAGER" && user.warehouseId === warehouseId) return { ok: true };
  return { ok: false, status: 403, message: "Forbidden" };
}

/** --------------------------------
 * GET /warehouses/:id/inventory
 * -------------------------------- */
export const getWarehouseInventory = async (req: Request, res: Response) => {
  const warehouseId = req.params.id;
  const access = enforceWarehouseAccess(req, warehouseId);
  if (!access.ok) return res.status(access.status).json({ error: access.message });

  try {
    const inventory = await warehouseRepo.getInventoryForWarehouse(warehouseId);
    return res.json({ warehouseId, inventory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /warehouses/:id/workers
 * -------------------------------- */
export const getWarehouseWorkers = async (req: Request, res: Response) => {
  const warehouseId = req.params.id;
  const access = enforceWarehouseAccess(req, warehouseId);
  if (!access.ok) return res.status(access.status).json({ error: access.message });

  try {
    const workers = workerRepo.listWorkers().filter((w) => w.warehouseId === warehouseId);
    const tasks = await taskRepo.listTasks();
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const activities: WarehouseWorkerActivity[] = workers.map((w) => {
      const activeTasks = tasks.filter(
        (t) =>
          t.warehouseId === warehouseId &&
          t.workerId === w.id &&
          (t.status === "IN_PROGRESS" || t.status === "PENDING_PICK")
      ).length;
      const completedTasksToday = tasks.filter(
        (t) =>
          t.warehouseId === warehouseId &&
          t.workerId === w.id &&
          t.status === "DONE" &&
          new Date(t.createdAt).getTime() >= dayAgo // using createdAt as proxy for completion
      ).length;
      const capacity = (w as any).capacity ?? (w as any).maxTasks ?? 8;
      const utilization = capacity === 0 ? 0 : activeTasks / capacity;
      return {
        workerId: w.id,
        warehouseId,
        activeTasks,
        completedTasksToday,
        capacity,
        utilization,
      };
    });
    return res.json({ warehouseId, workers: activities });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /warehouses/:id/metrics
 * -------------------------------- */
export const getWarehouseMetrics = async (req: Request, res: Response) => {
  const warehouseId = req.params.id;
  const access = enforceWarehouseAccess(req, warehouseId);
  if (!access.ok) return res.status(access.status).json({ error: access.message });

  try {
    const svc = new MetricsService();
    const metrics: WarehouseMetrics = await svc.getWarehouseMetrics(warehouseId, new Date());
    return res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /warehouses/:id/backorders
 * -------------------------------- */
export const getWarehouseBackorders = async (req: Request, res: Response) => {
  const warehouseId = req.params.id;
  const access = enforceWarehouseAccess(req, warehouseId);
  if (!access.ok) return res.status(access.status).json({ error: access.message });

  try {
    const now = Date.now();
    const items = backorderRepo.listByWarehouse(warehouseId).map((b) => ({
      ...b,
      waitingSeconds: (now - new Date(b.createdAt).getTime()) / 1000,
    }));
    return res.json({ warehouseId, backorders: items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /warehouses/:id
 * -------------------------------- */
export const getWarehouseById = async (req: Request, res: Response) => {
  try {
    const access = enforceWarehouseAccess(req, req.params.id);
    if (!access.ok) return res.status(access.status).json({ error: access.message });
    const wh = warehouseRepo.findById(req.params.id);
    if (!wh) return res.status(404).json({ error: "Warehouse not found" });
    res.json({
      id: wh.id,
      name: wh.name,
      location: {
        street: (wh as any).location?.street ?? (wh as any).location?.line1,
        city: wh.location.city,
        province: (wh as any).location?.province,
        postal: wh.location.postal,
        lat: wh.location.lat,
        lng: wh.location.lng,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * POST /warehouses
 * Body: { id, name, location, inventory }
 * -------------------------------- */
export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const warehouse = req.body;

    if (!warehouse.id || !warehouse.name || !warehouse.location) {
      return res.status(400).json({
        error: "id, name, and location are required",
      });
    }

    warehouseRepo.save(warehouse);

    res.status(201).json(warehouse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
