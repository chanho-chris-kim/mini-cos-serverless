// backend/src/api/controllers/scan.controller.ts

import type { Request, Response } from "express";
import { OrderService } from "../../domain/orders/order.service";
import { TaskService } from "../../domain/tasks/task.service";

const orderService = new OrderService();
const taskService = new TaskService();

/**
 * POST /scan
 * Worker scans a box in a specific zone (PICKING, PACKING, OUTBOUND, etc.)
 */
export const scanBox = async (req: Request, res: Response) => {
  try {
    const { boxId, userId, warehouseId, zone } = req.body;

    if (!boxId || !userId || !warehouseId || !zone) {
      return res.status(400).json({
        error: "boxId, userId, warehouseId, and zone are required",
      });
    }

    // Update box state internally
    const result = await orderService.scanBox({
      boxId,
      userId,
      warehouseId,
      zone,
    });

    // Mark task complete if exists
    await taskService.completeTaskForBox(boxId, userId);

    return res.json({
      orderId: result.order.id,
      boxId,
      previousState: result.previousState,
      newState: result.newState,
      message: `${zone} scan: ${result.previousState} → ${result.newState}`,
    });
  } catch (err: any) {
    console.error("Scan failed:", err);
    return res.status(500).json({ error: err.message });
  }
};
