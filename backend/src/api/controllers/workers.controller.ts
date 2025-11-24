import { Request, Response } from "express";
import { WorkerService } from "../../domain/workers/worker.service";

const service = new WorkerService();

export const getWorkers = (_req: Request, res: Response) => {
  res.json(service.getAll());
};
