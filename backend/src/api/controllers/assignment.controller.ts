// backend/src/api/controllers/assignment.controller.ts
import type { Request, Response } from "express";
import { AssignmentService } from "../../domain/ai/assignment.service";

const service = new AssignmentService();

export const autoAssignAll = async (_req: Request, res: Response) => {
  try {
    const assignments = await service.autoAssignTasks();
    assignments.forEach((a) =>
      console.log(
        `[ASSIGNMENT] Task ${a.taskId} -> Worker ${a.workerId}${a.workerName ? ` (${a.workerName})` : ""}`
      )
    );
    res.json({ ok: true, assignments });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Generic endpoint: given an incoming order payload,
 * choose warehouse + generate tasks + assign workers.
 *
 * This delegates to the AI AssignmentService so all logic lives in one place.
 */
export const processIncomingOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, customerName, destination, boxes } = req.body;

    const result = await service.createIncomingOrder({
      orderId,
      customerName,
      destination,
      boxes,
    });

    return res.status(201).json({
      ok: true,
      order: result.order,
      warehouse: result.warehouse,
    });
  } catch (err: any) {
    console.error("processIncomingOrder failed:", err);
    res.status(500).json({ error: err.message });
  }
};
