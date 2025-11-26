// backend/src/domain/orders/order.repository.ts
import { orders } from "../../data/orders";
import type { OrderEntity } from "./order.model";
import type { BoxEntity, BoxState, ReturnCategory } from "./box.model";

export class OrderRepository {
  /** BASIC ORDER CRUD */

  async listOrders(): Promise<OrderEntity[]> {
    return orders;
  }

  async findById(id: string): Promise<OrderEntity | null> {
    return orders.find((o) => o.id === id) || null;
  }

  async saveOrder(order: OrderEntity): Promise<void> {
    const idx = orders.findIndex((o) => o.id === order.id);
    if (idx === -1) {
      orders.push(order);
    } else {
      orders[idx] = order;
    }
  }

  /** BOX HELPERS */

  async listBoxes(): Promise<BoxEntity[]> {
    return orders.flatMap((o) => o.boxes);
  }

  async findOrderByBoxId(boxId: string): Promise<OrderEntity | null> {
    for (const order of orders) {
      if (order.boxes.some((b) => b.id === boxId)) return order;
    }
    return null;
  }

  async getBox(boxId: string): Promise<BoxEntity | null> {
    for (const order of orders) {
      const box = order.boxes.find((b) => b.id === boxId);
      if (box) return box;
    }
    return null;
  }

  /** UPDATE BOX STATE (used by scans / tasks / returns) */

  async updateBoxState(
    boxId: string,
    newState: BoxState
  ): Promise<BoxEntity | null> {
    const order = await this.findOrderByBoxId(boxId);
    if (!order) return null;

    const box = order.boxes.find((b) => b.id === boxId);
    if (!box) return null;

    box.state = newState;
    await this.saveOrder(order);
    return box;
  }

  /** CLASSIFY RETURN (used by returns flow) */

  async classifyReturn(
    boxId: string,
    category: ReturnCategory,
    notes?: string
  ): Promise<BoxEntity | null> {
    const order = await this.findOrderByBoxId(boxId);
    if (!order) return null;

    const box = order.boxes.find((b) => b.id === boxId);
    if (!box) return null;

    box.state = "RETURN_CLASSIFIED";
    box.returnCategory = category;
    if (notes) box.notes = notes;

    await this.saveOrder(order);
    return box;
  }

  /** ORDER STATUS RECALC (derived from box states) */

  async recomputeOrderStatus(orderId: string): Promise<string> {
    const order = await this.findById(orderId);
    if (!order) throw new Error("Order not found");

    const states = order.boxes.map((b) => b.state);
    let status: OrderEntity["status"] = order.status;

    if (states.every((s) => s === "DELIVERED")) {
      status = "DELIVERED";
    } else if (states.every((s) => s === "RETURN_CLASSIFIED")) {
      status = "RETURNED";
    } else if (
      states.some((s) =>
        ["PICKED", "PACKED", "OUTBOUND", "SHIPPED", "IN_TRANSIT"].includes(s)
      )
    ) {
      status = "PARTIAL";
    } else if (states.every((s) => s === "PENDING")) {
      status = "PENDING";
    }

    order.status = status;
    await this.saveOrder(order);

    return status;
  }

  /** UPDATE WHOLE ORDER */

  async updateOrder(order: OrderEntity): Promise<void> {
    await this.saveOrder(order);
  }

  /** SEED HOOK (no-op for now, data file already populated) */

  seedIfEmpty() {
    if (orders.length > 0) return;
    // You could push default orders here if data/orders.ts were empty.
  }
}
