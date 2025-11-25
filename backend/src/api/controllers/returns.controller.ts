import type { Request, Response } from "express";
import { orders } from "../../data/orders";
import { tasks } from "../../data/tasks";
import type { BoxEntity, ReturnCategory } from "../../domain/orders/box.model";
import type { TaskEntity } from "../../domain/tasks/task.model";

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function findBox(boxId: string): { orderIndex: number; boxIndex: number; box: BoxEntity } | null {
  for (let oi = 0; oi < orders.length; oi++) {
    const bi = orders[oi].boxes.findIndex(b => b.id === boxId);
    if (bi !== -1) {
      return { orderIndex: oi, boxIndex: bi, box: orders[oi].boxes[bi] };
    }
  }
  return null;
}

function ensureQATask(boxId: string, warehouseId: string): TaskEntity {
  const existing = tasks.find(t => t.boxId === boxId && t.type === "QA");
  if (existing) return existing;

  const task: TaskEntity = {
    id: genId("T"),
    warehouseId,
    type: "QA",
    boxId,
    status: "PENDING",
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  tasks.push(task);
  return task;
}

function markQADone(boxId: string) {
  const t = tasks.find(x => x.boxId === boxId && x.type === "QA");
  if (t) t.status = "DONE";
}

function computeOrderStatus(boxes: BoxEntity[]) {
  const states = boxes.map(b => b.state);

  const allReturnClassified = states.every(s => s === "RETURN_CLASSIFIED");
  if (allReturnClassified) return "RETURNED";

  const allDeliveredOrReturn = states.every(s =>
    s === "DELIVERED" ||
    s === "RETURN_RECEIVED" ||
    s === "QA_PENDING" ||
    s === "QA_IN_PROGRESS" ||
    s === "QA_DONE" ||
    s === "RETURN_CLASSIFIED"
  );
  if (allDeliveredOrReturn && states.some(s => s !== "DELIVERED")) return "RETURNED";

  const allDelivered = states.every(s => s === "DELIVERED");
  if (allDelivered) return "DELIVERED";

  return "FULFILLED";
}

export async function scanReturnBox(req: Request, res: Response) {
  try {
    const { boxId, userId, warehouseId } = req.body as {
      boxId: string;
      userId: string;
      warehouseId: string;
    };

    if (!boxId || !userId || !warehouseId) {
      return res.status(400).json({ message: "boxId, userId, warehouseId are required" });
    }

    const found = findBox(boxId);
    if (!found) {
      return res.status(404).json({ message: `Box ${boxId} not found` });
    }

    const order = orders[found.orderIndex];
    const box = order.boxes[found.boxIndex];

    // Intake scan transitions
    box.state = "RETURN_RECEIVED";
    box.state = "QA_PENDING";

    ensureQATask(box.id, warehouseId);

    order.status = computeOrderStatus(order.boxes) as any;

    return res.json(box);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal error in /returns/scan" });
  }
}

export async function classifyReturnBox(req: Request, res: Response) {
  try {
    const { boxId } = req.params;
    const { category, notes } = req.body as {
      category: ReturnCategory;
      notes?: string;
    };

    if (!boxId || !category) {
      return res.status(400).json({ message: "boxId param and category body are required" });
    }

    const found = findBox(boxId);
    if (!found) {
      return res.status(404).json({ message: `Box ${boxId} not found` });
    }

    const order = orders[found.orderIndex];
    const box = order.boxes[found.boxIndex];

    // QA stage transitions
    box.state = "QA_IN_PROGRESS";
    box.returnCategory = category;
    if (notes) box.notes = notes;

    box.state = "RETURN_CLASSIFIED";
    markQADone(box.id);

    order.status = computeOrderStatus(order.boxes) as any;

    return res.json(box);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal error in /returns/:boxId/classify" });
  }
}