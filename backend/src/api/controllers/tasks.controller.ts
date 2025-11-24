import { Request, Response } from "express";
import { TaskService } from "../../domain/tasks/task.service";

const service = new TaskService();

export const getTasks = (_req: Request, res: Response) => {
  res.json(service.getAll());
};

export const updateTaskStatus = (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = service.updateStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ message: "Task not found" });
  res.json(updated);
};

export const deleteTask = (req: Request, res: Response) => {
  const deleted = service.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Task not found" });
  res.status(204).send();
};
