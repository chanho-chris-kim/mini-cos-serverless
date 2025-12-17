// backend/src/domain/orders/order.repository.ts
import type { OrderEntity } from "./order.model";
import type { BoxEntity, ReturnCategory } from "./box.model";
import { taskRepo } from "../sharedRepos";

let orders: OrderEntity[] = [];

export class OrderRepository {
  listOrders(): OrderEntity[] {
    return orders;
  }

  findById(id: string): OrderEntity | null {
    return orders.find((o) => o.id === id) || null;
  }

  saveOrder(order: OrderEntity): void {
    const idx = orders.findIndex((o) => o.id === order.id);
    if (idx === -1) orders.push(order);
    else orders[idx] = order;
  }

  updateOrder(order: OrderEntity): void {
    this.saveOrder(order);
  }

  createOrder(data: any): OrderEntity {
    const id = data.id ?? `O-${Date.now()}`;

    const newOrder: OrderEntity = {
      id,
      customerId: data.customerId ?? `C-${Date.now()}`,
      customerName: data.customerName ?? "Simulated Customer",
      createdAt: new Date().toISOString(),
      destination: data.destination,
      status: "PENDING",
      routes: data.routes ?? {},
      boxes: data.boxes ?? [],
    };

    orders.push(newOrder);
    return newOrder;
  }

  listBoxes(): BoxEntity[] {
    return orders.flatMap((o) => o.boxes);
  }

  findOrderByBoxId(boxId: string): OrderEntity | null {
    return orders.find((o) => o.boxes.some((b) => b.id === boxId)) || null;
  }

  getBox(boxId: string): BoxEntity | null {
    for (const order of orders) {
      const box = order.boxes.find((b) => b.id === boxId);
      if (box) return box;
    }
    return null;
  }

  updateBoxState(boxId: string, newState: BoxEntity["state"]): BoxEntity | null {
    for (const order of orders) {
      const box = order.boxes.find((b) => b.id === boxId);
      if (box) {
        box.state = newState;
        return box;
      }
    }
    return null;
  }

  classifyReturn(boxId: string, category: ReturnCategory, notes?: string) {
    for (const order of orders) {
      const box = order.boxes.find((b) => b.id === boxId);
      if (box) {
        box.returnCategory = category;
        box.returnNotes = notes;
        box.state = "QA_DONE";
        return box;
      }
    }
    return null;
  }

  async recomputeOrderStatus(orderId: string): Promise<string> {
    const order = this.findById(orderId);
    if (!order) throw new Error("Order not found");

    const tasks = await taskRepo.listTasks();
    const shipTasks = tasks.filter((t) => t.orderId === orderId && t.type === "SHIP");
    const allShipDone =
      shipTasks.length > 0 && shipTasks.every((t) => t.status === "DONE");

    console.log(
      "[ORDER STATUS CHECK]",
      order.id,
      "SHIP tasks:",
      shipTasks.map((t) => t.status)
    );

    if (allShipDone) {
      order.status = "FULFILLED";
    } else {
      order.status = "IN_PROGRESS";
    }

    this.saveOrder(order);
    return order.status;
  }

  seedIfEmpty(defaults: OrderEntity[] = []) {
    if (orders.length === 0) orders = [...defaults];
  }
}
