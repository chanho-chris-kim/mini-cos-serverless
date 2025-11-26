import api from "./apiClient";
import type { Order } from "../lib/types";

export async function fetchOrders(): Promise<Order[]> {
  const res = await api.get("/orders");
  return res.data;
}

export async function fetchOrder(id: string): Promise<Order> {
  const res = await api.get(`/orders/${id}`);
  return res.data;
}

export async function createOrder(data: Partial<Order>): Promise<Order> {
  const res = await api.post("/orders", data);
  return res.data;
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<void> {
  await api.patch(`/orders/${id}/status`, { status });
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/orders/${id}`);
}
