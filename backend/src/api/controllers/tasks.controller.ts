// backend/src/api/controllers/tasks.controller.ts

import type { Request, Response } from "express";
import { TaskService } from "../../domain/tasks/task.service";

const service = new TaskService();

/** --------------------------------
 * GET /tasks
 * -------------------------------- */
export const getTasks = async (_req: Request, res: Response) => {
  try {
    const tasks = await service.listTasks();
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * PATCH /tasks/:id/status
 * Body: { status }
 * -------------------------------- */
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updated = await service.updateStatus(id, status);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * DELETE /tasks/:id
 * -------------------------------- */
export const deleteTask = async (_req: Request, res: Response) => {
  try {
    // Optional: tasks aren't usually deleted in enterprise WMS
    res.json({ message: "Task deletion not implemented" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /tasks/worker/:id
 * -------------------------------- */
export const getTasksForWorker = async (req: Request, res: Response) => {
  try {
    const workerId = req.params.id;
    const tasks = await service.getTasksForWorker(workerId);
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
