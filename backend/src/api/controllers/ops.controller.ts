import type { Request, Response } from "express";
import type { RequestWithUser } from "../../middleware/auth.middleware";
import { OpsMetricsService } from "../../domain/ops/metrics.service";
import { warehouseEventsRepo, backorderRepo, taskRepo } from "../../domain/sharedRepos";
import type { BackorderSummary } from "../../types";

const metricsService = new OpsMetricsService();

export const getOpsSummary = async (req: Request, res: Response) => {
  const user = (req as RequestWithUser).user;
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const now = Date.now();
    const summary = await metricsService.computeSummary(now);
    return res.json(summary);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getOpsExceptions = async (req: Request, res: Response) => {
  const user = (req as RequestWithUser).user;
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const limit = Number(req.query.limit ?? 50) || 50;
    const events = warehouseEventsRepo
      .getEventsForWarehouse("ALL", limit * 2)
      .filter((e) =>
        ["BACKORDER_CREATED", "TASK_FAILED", "LOW_STOCK", "STUCK_TASK"].includes(e.type)
      )
      .slice(0, limit);

    // Add detected stuck tasks as synthetic exceptions
    const now = Date.now();
    const stuck = await metricsService.detectStuckTasks(now);
    const stuckEvents = stuck.map((t) => ({
      id: `stuck-${t.id}`,
      warehouseId: t.warehouseId,
      type: "STUCK_TASK",
      message: `Task ${t.id} stuck in IN_PROGRESS`,
      timestamp: new Date().toISOString(),
      meta: { taskId: t.id },
    }));

    // Low inventory synthetic events
    const lowInv = metricsService.detectLowInventory().map((i) => ({
      id: `low-${i.warehouseId}-${i.sku}`,
      warehouseId: i.warehouseId,
      type: "LOW_STOCK",
      message: `Low stock ${i.sku} (${i.quantity})`,
      timestamp: new Date().toISOString(),
      meta: { sku: i.sku, quantity: i.quantity },
    }));

    const backorderCount = backorderRepo.listByWarehouse("ALL" as any).length;
    const backorderEvents =
      backorderCount > 0
        ? [
            {
              id: `bo-${Date.now()}`,
              warehouseId: "ALL",
              type: "BACKORDER_CREATED",
              message: `${backorderCount} backorders open`,
              timestamp: new Date().toISOString(),
            },
          ]
        : [];

    const combined = [...events, ...stuckEvents, ...lowInv, ...backorderEvents]
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return res.json({ exceptions: combined });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getBackorderMetrics = async (req: Request, res: Response) => {
  const user = (req as RequestWithUser).user;
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const now = Date.now();
    const summary: BackorderSummary = metricsService.getBackorderSummary(now);
    return res.json({ summary });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
