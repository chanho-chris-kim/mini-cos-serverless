// backend/src/handlers/tasks.handler.ts
import { Request, Response } from "express";
import {
  assignTasks,
  getAllTasks,
  updateTaskStatus,
  deleteTask,
} from "../services/taskEngine";

// Fetch all tasks
export async function fetchTasks(req: Request, res: Response) {
  try {
    const tasks = await getAllTasks();
    return res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed to fetch tasks" });
  }
}

// Assign tasks to workers
export async function assignTasksEndpoint(req: Request, res: Response) {
  try {
    const workers = req.body.workers || [{ id: "w-1" }, { id: "w-2" }];
    const assigned = await assignTasks(await getAllTasks(), workers);
    return res.status(200).json({ assigned });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed to assign tasks" });
  }
}

// Update task status (used by dropdown)
export async function updateTaskStatusEndpoint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const task = await updateTaskStatus(id, status);
    return res.status(200).json({ task });
  } catch (err: any) {
    console.error(err);
    if (err.message === "Task not found") {
      return res.status(404).json({ error: "Task not found" });
    }
    return res.status(500).json({ error: "failed to update task status" });
  }
}

// DELETE /tasks/:id
export const deleteTaskEndpoint = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await deleteTask(id);
    return res.status(200).json({ success: true, task: deleted });
  } catch (err: any) {
    if (err.message === "Task not found") {
      return res.status(404).json({ error: "Task not found" });
    }
    console.error(err);
    return res.status(500).json({ error: "Failed to delete task" });
  }
};
