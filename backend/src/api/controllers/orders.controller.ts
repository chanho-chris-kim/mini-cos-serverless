import { Request, Response } from "express";
import { OrderService } from "../../domain/orders/order.service";

const service = new OrderService();

export const getOrders = (_req: Request, res: Response) => {
  const all = service.getAll();
  res.json(all);
};

export const getOrderById = (req: Request, res: Response) => {
  const order = service.getById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

export const createOrder = (req: Request, res: Response) => {
  try {
    const { customer, items } = req.body;
    const created = service.create({ customer, items });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create order" });
  }
};

export const updateOrderStatus = (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = service.updateStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ message: "Order not found" });
  res.json(updated);
};

export const deleteOrder = (req: Request, res: Response) => {
  try {
    service.delete(req.params.id);
    // Idempotent delete: always return 204 even if order already removed
    res.status(204).send();
  } catch (err) {
    console.error("Failed to delete order", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
};
