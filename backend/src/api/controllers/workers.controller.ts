// backend/src/api/controllers/workers.controller.ts

import type { Request, Response } from "express";
import { WorkerRepository } from "../../domain/workers/worker.repository";

const repo = new WorkerRepository();

/** --------------------------------
 * GET /workers
 * -------------------------------- */
export const getWorkers = async (_req: Request, res: Response) => {
  try {
    const workers = await repo.listWorkers();
    res.json(workers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /workers/:id
 * -------------------------------- */
export const getWorkerById = async (req: Request, res: Response) => {
  try {
    const worker = await repo.getWorker(req.params.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json(worker);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * POST /workers
 * Body: { id, name, role, maxTasks, homeBase }
 * -------------------------------- */
export const createWorker = async (req: Request, res: Response) => {
  try {
    const worker = req.body;

    if (!worker.id || !worker.name || !worker.role) {
      return res.status(400).json({
        error: "id, name, and role are required",
      });
    }

    await repo.saveWorker(worker);
    res.status(201).json(worker);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * PATCH /workers/:id/load
 * Body: { currentTasks }
 * -------------------------------- */
export const updateWorkerLoad = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentTasks } = req.body;

    if (typeof currentTasks !== "number") {
      return res.status(400).json({ error: "currentTasks must be a number" });
    }

    await repo.updateTaskLoad(id, currentTasks);

    res.json({
      message: "Worker load updated",
      workerId: id,
      currentTasks,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
