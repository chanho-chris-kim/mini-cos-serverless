import { v4 as uuidv4 } from "uuid";
import { inMemoryOrders } from "../data/orders";
import type { Order } from "../types";

export class OrderService {
  async createOrder(payload: Partial<Order>): Promise<Order> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const order: Order = {
      id,
      createdAt: now,
      status: "NEW",
      items: payload.items || [],
      customer: payload.customer || { name: "Anonymous" },
    };

    inMemoryOrders[id] = order;
    return order;
  }

  async getOrder(id: string): Promise<Order | null> {
    return inMemoryOrders[id] || null;
  }

  async getAllOrders(): Promise<Order[]> {
    return Object.values(inMemoryOrders);
  }
}
