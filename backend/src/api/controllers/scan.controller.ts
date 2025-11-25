import type { Request, Response } from "express";
import { orders } from "../../data/orders";
import { tasks } from "../../data/tasks";
import type { BoxEntity, BoxState } from "../../domain/orders/box.model";
import type { TaskEntity, TaskType } from "../../domain/tasks/task.model";

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

function ensureTaskForBox(boxId: string, warehouseId: string, type: TaskType): TaskEntity {
  const existing = tasks.find(t => t.boxId === boxId && t.type === type);
  if (existing) return existing;

  const task: TaskEntity = {
    id: genId("T"),
    warehouseId,
    type,
    boxId,
    status: "PENDING",
    dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  };
  tasks.push(task);
  return task;
}

function markTaskDone(boxId: string, type: TaskType) {
  const t = tasks.find(x => x.boxId === boxId && x.type === type);
  if (t) t.status = "DONE";
}

function computeOrderStatus(boxes: BoxEntity[]) {
  const states = boxes.map(b => b.state);

  const allDelivered = states.every(s => s === "DELIVERED" || s === "RETURN_CLASSIFIED");
  if (allDelivered) return "DELIVERED";

  const anyReturn = states.some(s =>
    s === "RETURN_RECEIVED" || s === "QA_PENDING" || s === "QA_IN_PROGRESS" || s === "QA_DONE" || s === "RETURN_CLASSIFIED"
  );
  if (anyReturn && states.every(s =>
    s === "DELIVERED" || s === "RETURN_RECEIVED" || s === "QA_PENDING" || s === "QA_IN_PROGRESS" || s === "QA_DONE" || s === "RETURN_CLASSIFIED"
  )) {
    return "RETURNED";
  }

  const fulfilledStates: BoxState[] = [
    "SHIPPED","IN_TRANSIT","DELIVERED","RETURN_RECEIVED","QA_PENDING","QA_IN_PROGRESS","QA_DONE","RETURN_CLASSIFIED"
  ];
  const allFulfilled = states.every(s => fulfilledStates.includes(s));
  if (allFulfilled) return "FULFILLED";

  const progressedStates: BoxState[] = ["PICKED","PACKED","OUTBOUND","SHIPPED","IN_TRANSIT","DELIVERED"];
  const anyProgress = states.some(s => progressedStates.includes(s));
  const anyPending = states.some(s => s === "PENDING" || s === "PICK_ASSIGNED");
  if (anyProgress && anyPending) return "PARTIAL";

  return "PENDING";
}

export async function scanBox(req: Request, res: Response) {
  try {
    const { boxId, userId, warehouseId, zone } = req.body as {
      boxId: string;
      userId: string;
      warehouseId: string;
      zone: "PICKING" | "PACKING" | "SHIPPING";
    };

    if (!boxId || !userId || !warehouseId || !zone) {
      return res.status(400).json({ message: "boxId, userId, warehouseId, zone are required" });
    }

    const found = findBox(boxId);
    if (!found) {
      return res.status(404).json({ message: `Box ${boxId} not found` });
    }

    const order = orders[found.orderIndex];
    const box = order.boxes[found.boxIndex];

    const prev = box.state;
    let next: BoxState = prev;

    // Zone-based state machine
    if (zone === "PICKING") {
      if (prev === "PENDING" || prev === "PICK_ASSIGNED") next = "PICKED";
      ensureTaskForBox(box.id, warehouseId, "PICK");
      markTaskDone(box.id, "PICK");
      ensureTaskForBox(box.id, warehouseId, "PACK");
    }

    if (zone === "PACKING") {
      if (prev === "PICKED") next = "PACKED";
      ensureTaskForBox(box.id, warehouseId, "PACK");
      markTaskDone(box.id, "PACK");
      ensureTaskForBox(box.id, warehouseId, "SHIP");
    }

    if (zone === "SHIPPING") {
      if (prev === "PACKED" || prev === "OUTBOUND") next = "SHIPPED";
      ensureTaskForBox(box.id, warehouseId, "SHIP");
      markTaskDone(box.id, "SHIP");
      if (!box.trackingNumber) {
        box.trackingNumber = genId("TRK");
      }
    }

    box.state = next;

    // If shipped, assume in transit after scan (can be updated later by courier webhook)
    if (next === "SHIPPED") {
      box.state = "IN_TRANSIT";
      next = "IN_TRANSIT";
    }

    order.status = computeOrderStatus(order.boxes) as any;

    return res.json({
      orderId: order.id,
      boxId: box.id,
      previousState: prev,
      newState: next,
      message: `${zone} scan: ${prev} → ${next}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal error in /scan" });
  }
}
