// backend/src/api/controllers/workers.controller.ts

import type { Request, Response } from "express";
import { workerRepo } from "../../domain/sharedRepos";

/** --------------------------------
 * GET /workers
 * -------------------------------- */
export const getWorkers = async (_req: Request, res: Response) => {
  try {
    const workers = workerRepo.listWorkers().map((w) => ({
      ...w,
      load: w.currentLoad ?? 0,
      capacity: w.capacity ?? w.maxTasks ?? 0,
      utilization:
        (w.capacity ?? w.maxTasks ?? 0) === 0
          ? 0
          : (w.currentLoad ?? 0) / (w.capacity ?? w.maxTasks ?? 0),
    }));
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
    const worker = workerRepo.findById(req.params.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json({
      ...worker,
      load: worker.currentLoad ?? 0,
      capacity: worker.capacity ?? worker.maxTasks ?? 0,
      utilization:
        (worker.capacity ?? worker.maxTasks ?? 0) === 0
          ? 0
          : (worker.currentLoad ?? 0) / (worker.capacity ?? worker.maxTasks ?? 0),
    });
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

    workerRepo.save(worker);
    res.status(201).json(worker);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * PATCH /workers/:id/load
 * Body: { currentLoad }
 * -------------------------------- */
export const updateWorkerLoad = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentLoad } = req.body;

    if (typeof currentLoad !== "number") {
      return res.status(400).json({ error: "currentLoad must be a number" });
    }

    const worker = workerRepo.findById(id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    worker.currentLoad = currentLoad;
    worker.currentTasks = currentLoad;
    workerRepo.save(worker);

    res.json({
      message: "Worker load updated",
      workerId: id,
      currentLoad,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
