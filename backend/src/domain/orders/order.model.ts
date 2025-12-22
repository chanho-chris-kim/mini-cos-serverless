// backend/src/domain/orders/order.model.ts
import type { BoxEntity } from "./box.model";
import type { Address } from "../../types";

export interface OrderEntity {
  id: string;
  customerId: string;
  customerName: string;
  createdAt: string;

  status: "PENDING" | "IN_PROGRESS" | "PARTIAL" | "FULFILLED" | "DELIVERED" | "RETURNED" | string;

  destination?: Address & { street?: string };

  // Multi-warehouse routing (warehouseId -> boxIds)
  routes?: Record<string, string[]>;

  // Boxes belonging to the order (required for scanning/returns)
  boxes: BoxEntity[];
}
