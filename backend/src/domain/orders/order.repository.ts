import { orders } from "../../data/orders";
import type { OrderEntity } from "./order.model";

export class OrderRepository {
  getAll(): OrderEntity[] {
    return orders;
  }

  getById(id: string): OrderEntity | undefined {
    return orders.find((o) => o.id === id);
  }

  save(order: OrderEntity): OrderEntity {
    const index = orders.findIndex((o) => o.id === order.id);
    if (index === -1) {
      orders.push(order);
    } else {
      orders[index] = order;
    }
    return order;
  }

  delete(id: string): boolean {
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return false;
    orders.splice(index, 1);
    return true;
  }
}
