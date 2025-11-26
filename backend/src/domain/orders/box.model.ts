// backend/src/domain/orders/box.model.ts
export type BoxState =
  | "PENDING"
  | "PICK_ASSIGNED"
  | "PICKED"
  | "PACKED"
  | "OUTBOUND"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RETURN_RECEIVED"
  | "QA_PENDING"
  | "QA_IN_PROGRESS"
  | "QA_DONE"
  | "RETURN_CLASSIFIED";

export type ReturnCategory =
  | "FULL_PRICE"
  | "DISCOUNT"
  | "REFURBISH"
  | "SALVAGE"
  | "TRASH";

export interface BoxEntity {
  id: string;
  orderId: string;
  sku: string;
  state: BoxState;
  warehouseId?: string;
  trackingNumber?: string;
  returnCategory?: ReturnCategory;
  notes?: string;
}
