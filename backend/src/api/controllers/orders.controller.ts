// backend/src/api/controllers/orders.controller.ts
import type { Request, Response } from "express";
import { OrderService } from "../../domain/orders/order.service";

const service = new OrderService();

/** GET /orders */
export const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await service.listOrders();
    res.json(orders);
  } catch (err: any) {
    console.error("getOrders failed:", err);
    res.status(500).json({ error: err.message });
  }
};

/** GET /orders/:id */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await service.getOrder(req.params.id);
    res.json(order);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

/** PATCH /orders/:id/status — recompute from boxes */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const status = await service.updateStatusDerived(req.params.id);
    res.json({ id: req.params.id, status });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/** POST /orders — simple demo create (not wired to frontend yet) */
export const createOrder = async (req: Request, res: Response) => {
  // Optional: implement later; keeping stubbed for now.
  res.status(501).json({ error: "Order creation not implemented in demo" });
};

/** DELETE /orders/:id — not recommended in real WMS */
export const deleteOrder = async (_req: Request, res: Response) => {
  res.json({ message: "Order deletion not implemented" });
};
