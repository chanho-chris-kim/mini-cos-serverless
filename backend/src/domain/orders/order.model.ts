// backend/src/domain/orders/order.model.ts
import type { BoxEntity } from "./box.model";

export interface OrderEntity {
  id: string;
  customerId: string;
  customerName: string;
  createdAt: string;

  status: "PENDING" | "PARTIAL" | "FULFILLED" | "DELIVERED" | "RETURNED";

  // Multi-warehouse routing (warehouseId -> boxIds)
  routes?: Record<string, string[]>;

  // Boxes belonging to the order (required for scanning/returns)
  boxes: BoxEntity[];
}
