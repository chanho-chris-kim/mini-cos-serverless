// backend/src/api/controllers/assignment.controller.ts

import type { Request, Response } from "express";
import { TaskService } from "../../domain/tasks/task.service";

const service = new TaskService();

/** --------------------------------
 * POST /assign
 * Runs auto-assignment engine
 * -------------------------------- */
export const assignTasks = async (_req: Request, res: Response) => {
  try {
    const result = await service.autoAssign();

    res.json({
      message: `Assigned ${result.assigned} tasks`,
      details: result.details,
    });
  } catch (err: any) {
    console.error("Auto-assign failed:", err);
    res.status(500).json({ error: err.message });
  }
};
