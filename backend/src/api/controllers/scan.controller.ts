// backend/src/api/controllers/scan.controller.ts

import type { Request, Response } from "express";
import { TaskService } from "../../domain/tasks/task.service";

const taskService = new TaskService();

/**
 * POST /scan
 * Worker scans a box in a specific zone (PICKING, PACKING, OUTBOUND, etc.)
 */
export const scanBox = async (req: Request, res: Response) => {
  try {
    const completed = await taskService.completeNextInProgress();
    if (!completed) {
      return res.status(404).json({ error: "No in-progress tasks to scan" });
    }

    // Box and order status updates happen inside TaskRepository.updateStatus
    return res.json({
      ok: true,
      taskId: completed.id,
      boxId: completed.boxId,
      newStatus: completed.status,
    });
  } catch (err: any) {
    console.error("Scan failed:", err);
    return res.status(500).json({ error: err.message });
  }
};
