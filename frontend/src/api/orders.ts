import type { Order, Item } from "../types";
import { API } from "./apiClient";

// Capitalize first letters for customer names
const toCapitalCase = (str: string) =>
  str
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export async function fetchOrders(): Promise<Order[]> {
  const res = await API.get("/orders");
  return res.data;
}

export async function createOrder(
  customerName: string,
  items: Item[]
): Promise<Order> {
  const payload = {
    customer: {
      name: toCapitalCase(customerName || "Anonymous"),
      email: "",
      homeAddress: {
        line1: "",
        city: "",
        postal: "",
        lat: 0,
        lng: 0,
      }
    },
    items
  };

  const res = await API.post("/orders", payload);
  return res.data;
}

export async function deleteOrder(orderId: string): Promise<void> {
  await API.delete(`/orders/${orderId}`);
}
