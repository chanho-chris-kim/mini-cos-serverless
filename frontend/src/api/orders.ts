import axios from "axios";
import type { Order, Item, Task } from "../types";

const BASE_URL = "http://localhost:3000/orders";

// Capitalize first letters for customer names
const toCapitalCase = (str: string) =>
  str
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export async function fetchOrders(): Promise<Order[]> {
  const res = await axios.get(BASE_URL);
  return res.data;
}

export async function createOrder(
  customerName: string,
  items: Item[]
): Promise<{ order: Order; tasks: Task[] }> {
  const res = await axios.post(BASE_URL, {
    customer: { name: toCapitalCase(customerName || "Anonymous") },
    items,
  });
  return res.data;
}

export async function deleteOrder(orderId: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${orderId}`);
}
