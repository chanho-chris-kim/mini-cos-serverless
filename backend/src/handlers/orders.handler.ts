import { Request, Response } from "express";
import { OrderService } from "../services/orderService";
import {
  enqueueTasksForOrder,
  markTasksForDeletedOrder,
} from "../services/taskEngine";
import { inMemoryOrders } from "../data/orders";
import type { Order } from "../types";

const service = new OrderService();

// Fetch all orders
export async function fetchOrders(req: Request, res: Response) {
  try {
    const orders = await service.getAllOrders();
    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
}

// Create a new order
export async function createOrder(req: Request, res: Response) {
  const payload: Partial<Order> = req.body;
  try {
    const order = await service.createOrder(payload);
    const tasks = await enqueueTasksForOrder(order);
    return res.status(201).json({ order, tasks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create order" });
  }
}

// Delete an order and mark related tasks as DELETED_ORDER
export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!inMemoryOrders[id]) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Delete the order
  delete inMemoryOrders[id];

  try {
    const tasksUpdated = await markTasksForDeletedOrder(id);
    return res.status(200).json({ id, status: "deleted", tasksUpdated });
  } catch (err) {
    console.error("Failed to update tasks for deleted order:", err);
    return res
      .status(500)
      .json({ error: "Failed to update tasks for deleted order" });
  }
};
