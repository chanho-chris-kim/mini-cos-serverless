import { v4 as uuid } from "uuid";
import type { Item, Customer, OrderStatus } from "../../types";
import type { OrderEntity } from "./order.model";
import { OrderRepository } from "./order.repository";
import { TaskRepository } from "../tasks/task.repository";
import type { TaskEntity } from "../tasks/task.model";

interface CreateOrderInput {
  customer: Customer;
  items: Item[];
}

export class OrderService {
  private repo = new OrderRepository();
  private taskRepo = new TaskRepository();

  getAll(): OrderEntity[] {
    return this.repo.getAll();
  }

  getById(id: string): OrderEntity | undefined {
    return this.repo.getById(id);
  }

  create(input: CreateOrderInput): OrderEntity {
    const order: OrderEntity = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      status: "NEW",
      customer: input.customer,
      items: input.items,
    };
    const saved = this.repo.save(order);
    this.createTasksForOrder(saved);
    return saved;
  }

  updateStatus(id: string, status: OrderStatus): OrderEntity | undefined {
    const existing = this.repo.getById(id);
    if (!existing) return undefined;
    const updated: OrderEntity = { ...existing, status };
    return this.repo.save(updated);
  }

  delete(id: string): boolean {
    const existed = this.repo.delete(id);
    // Mark related tasks regardless so callers get consistent state
    this.taskRepo.removeByOrderId(id);
    return existed;
  }

  private createTasksForOrder(order: OrderEntity): void {
    order.items.forEach((item, index) => {
      const task: TaskEntity = {
        id: `${order.id}-t-${index}`,
        type: "PICK",
        sku: item.sku,
        qty: item.qty,
        orderId: order.id,
        order,
        status: "PENDING",
      };
      this.taskRepo.save(task);
    });
  }
}
