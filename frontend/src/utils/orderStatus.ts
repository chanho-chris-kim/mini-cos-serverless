import type { Order } from "../lib/types";

export function isOrderFulfilled(order: Order): boolean {
  const shipTasks = order.tasks?.filter((t: any) => t.type === "SHIP") ?? [];
  if (shipTasks.length === 0) return false;
  return shipTasks.every((t: any) => t.status === "DONE");
}
