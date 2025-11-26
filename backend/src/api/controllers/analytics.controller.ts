// backend/src/api/controllers/analytics.controller.ts
import type { Request, Response } from "express";
import { OrderRepository } from "../../domain/orders/order.repository";
import { TaskRepository } from "../../domain/tasks/task.repository";

const orderRepo = new OrderRepository();
const taskRepo = new TaskRepository();

/** --------------------------------
 * GET /analytics/overview
 * -------------------------------- */
export const getAnalyticsOverview = async (_req: Request, res: Response) => {
  try {
    const orders = await orderRepo.listOrders();
    const tasks = await taskRepo.listTasks();
    const boxes = await orderRepo.listBoxes();

    const activeOrders = orders.length;
    const pendingTasks = tasks.filter((t) => t.status !== "DONE").length;
    const boxesInTransit = boxes.filter((b) =>
      ["SHIPPED", "IN_TRANSIT"].includes(b.state)
    ).length;

    const returnedThisWeek = boxes.filter((b) =>
      ["QA_PENDING", "QA_IN_PROGRESS", "QA_DONE", "RETURN_CLASSIFIED"].includes(b.state)
    ).length;

    const tasksCompletedToday = tasks.filter((t) => {
      if (!t.createdAt) return false;
      const today = new Date().toISOString().slice(0, 10);
      return t.createdAt.slice(0, 10) === today && t.status === "DONE";
    }).length;

    res.json({
      activeOrders,
      pendingTasks,
      boxesInTransit,
      returnedThisWeek,
      tasksCompletedToday,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /analytics/orders-status
 * -------------------------------- */
export const getOrdersByStatus = async (_req: Request, res: Response) => {
  try {
    const orders = await orderRepo.listOrders();

    const grouped: Record<string, number> = {};
    for (const o of orders) {
      grouped[o.status] = (grouped[o.status] || 0) + 1;
    }

    res.json(grouped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /analytics/tasks-status
 * -------------------------------- */
export const getTasksByStatus = async (_req: Request, res: Response) => {
  try {
    const tasks = await taskRepo.listTasks();

    const grouped: Record<string, number> = {};
    for (const t of tasks) {
      grouped[t.status] = (grouped[t.status] || 0) + 1;
    }

    res.json(grouped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /analytics/returns
 * -------------------------------- */
export const getReturnAnalytics = async (_req: Request, res: Response) => {
  try {
    const boxes = await orderRepo.listBoxes();

    const states: Record<string, number> = {};
    const categories: Record<string, number> = {};

    for (const b of boxes) {
      states[b.state] = (states[b.state] || 0) + 1;

      if (b.returnCategory) {
        categories[b.returnCategory] =
          (categories[b.returnCategory] || 0) + 1;
      }
    }

    res.json({ states, categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
