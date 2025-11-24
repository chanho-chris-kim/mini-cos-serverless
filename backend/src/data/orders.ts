import type { OrderEntity } from "../domain/orders/order.model";

// In-memory store for orders used by the repository
export const orders: OrderEntity[] = [];
