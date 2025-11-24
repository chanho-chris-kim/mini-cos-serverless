import { Request, Response } from "express";
import { AssignmentService } from "../../domain/ai/assignment.service";

const service = new AssignmentService();

export const assignTasks = (_req: Request, res: Response) => {
  const updated = service.assignPendingTasks();
  res.json(updated);
};
