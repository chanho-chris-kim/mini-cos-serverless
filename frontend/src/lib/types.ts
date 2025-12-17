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

export type TaskType = "PICK" | "PACK" | "SHIP";
export type TaskStatus = "PENDING" | "PENDING_PICK" | "IN_PROGRESS" | "DONE" | "FAILED";

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
  capacity?: number;
  activeTasks?: number;
}

export interface Box {
  id: string;
  orderId: string;
  sku: string;
  state: BoxState;
  warehouseId?: string;
  trackingNumber?: string;
  returnCategory?: ReturnCategory;
}

export interface Order {
  id: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerName: string;
  email?: string;
  warehouseId?: string;
  destination: {
    address: string;
    city: string;
    postal: string;
    lat: number;
    lng: number;
  };
  createdAt: string;
  status: "PENDING" | "PARTIAL" | "FULFILLED" | "DELIVERED" | "RETURNED";
  boxes: Box[];
  tasks?: Task[];
  routes?: Record<string, string[]>;
}

export interface Task {
  id: string;
  warehouseId: string;
  type: TaskType;
  status: TaskStatus;
  boxId: string;
  workerId?: string | null;
  createdAt?: string;
}
export interface Warehouse {
  id: string;
  name: string;
  region?: string;
  location?: {
    street?: string;
    city?: string;
    province?: string;
    postal?: string;
    lat?: number;
    lng?: number;
  };
  address?: string;
  coords?: { lat: number; lng: number };
  capacity?: number;
  activeWorkerCount?: number;
  inventory?: Record<string, number>;
}

export interface WarehouseEvent {
  id: string;
  warehouseId: string;
  type: string;
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface ReturnItem {
  boxId: string;
  orderId: string;
  sku: string;
  warehouseId?: string;
  state: string;
  category?: string;
  customerName?: string;
  destinationAddress?: string;
  createdAt?: string;
  qaStartedAt?: string;
  classifiedAt?: string;
  notes?: string;
}

export interface ReturnDetail extends ReturnItem {
  events?: Array<{
    eventType: string;
    message: string;
    timestamp: string;
  }>;
  timeline?: {
    receivedAt?: string;
    qaStartedAt?: string;
    classifiedAt?: string;
    restockedAt?: string;
  };
}
