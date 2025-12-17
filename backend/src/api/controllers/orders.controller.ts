// backend/src/api/controllers/orders.controller.ts
import type { Request, Response } from "express";
import { OrderService } from "../../domain/orders/order.service";
import type { RequestWithUser } from "../../middleware/auth.middleware";

const service = new OrderService();

/** GET /orders */
export const getOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as RequestWithUser).user;
    const allOrders = await service.listOrders();

    let visibleOrders = allOrders;

    if (user?.role === "WORKER" && user.warehouseId) {
      visibleOrders = allOrders
        .map((o: any) => ({
          ...o,
          tasks: (o.tasks || []).filter(
            (t: any) => t.warehouseId === user.warehouseId
          ),
        }))
        .filter((o: any) => (o.tasks?.length ?? 0) > 0);
    }

    console.log(
      "[ORDERS API] Returning",
      visibleOrders.length,
      "orders with tasks"
    );
    visibleOrders.forEach((o: any) =>
      console.log(
        "[ORDERS API] Order",
        o.id,
        "has",
        o.tasks?.length ?? 0,
        "tasks"
      )
    );
    res.json(visibleOrders);
  } catch (err: any) {
    console.error("getOrders failed:", err);
    res.status(500).json({ error: err.message });
  }
};

/** GET /orders/:id */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const user = (req as RequestWithUser).user;
    const order: any = await service.getOrder(req.params.id);
    const tasks = order.tasks || [];

    if (user?.role === "WORKER" && user.warehouseId) {
      order.tasks = tasks.filter(
        (t: any) => t.warehouseId === user.warehouseId
      );
      if ((order.tasks?.length ?? 0) === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
    }

    console.log(
      "[ORDERS API] Order",
      order.id,
      "has",
      (order as any).tasks?.length ?? 0,
      "tasks"
    );
    res.json(order);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

/** POST /orders — now fully implemented */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const normalized = {
      customerName: body.customerName ?? body.name ?? "Unknown",
      destination: body.destination ?? {
        city: body.destination?.city ?? "Unknown",
        lat: body.destination?.lat ?? 0,
        lng: body.destination?.lng ?? 0,
      },
      items: body.items ?? body.boxes ?? [],
      ...body,
    };

    const result = await service.createOrder(normalized);
    res.status(201).json(result);
  } catch (err: any) {
    console.error("createOrder error:", err);
    res.status(400).json({ error: err.message });
  }
};

/** PATCH /orders/:id/status */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const status = await service.updateStatusDerived(req.params.id);
    res.json({ id: req.params.id, status });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/** DELETE /orders/:id */
export const deleteOrder = async (_req: Request, res: Response) => {
  res.json({ message: "Order deletion not implemented" });
};
