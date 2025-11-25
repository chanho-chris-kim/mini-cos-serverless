export type Role =
  | "ADMIN"
  | "OPS_MANAGER"
  | "WAREHOUSE_MANAGER"
  | "WORKER"
  | "QA"
  | "SUPPORT"
  | "ANALYTICS";

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

export type TaskType = "PICK" | "PACK" | "SHIP" | "QA" | "REFURBISH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";

export interface User {
  id: string;
  name: string;
  role: Role;
  warehouseId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
}

export interface Worker {
  id: string;
  name: string;
  warehouseId: string;
  zone?: "PICKING" | "PACKING" | "SHIPPING" | "RETURNS" | "QA";
  activeTaskIds?: string[];
}

export interface Box {
  id: string;
  sku: string;
  state: BoxState;
  warehouseId?: string;
  trackingNumber?: string;
  returnCategory?: ReturnCategory;
}

export interface Order {
  id: string;
  customerName: string;
  createdAt: string;
  status: "PENDING" | "PARTIAL" | "FULFILLED" | "DELIVERED" | "RETURNED";
  boxes: Box[];
  routes?: Record<string, string[]>;
}

export interface Task {
  id: string;
  warehouseId: string;
  type: TaskType;
  status: TaskStatus;
  boxId: string;
  assignedTo?: string;
  dueAt: string;
}
export interface Warehouse {
  id: string;
  name: string;
  region?: string;
  zones?: string[];
  stock?: Record<string, number>;
}
