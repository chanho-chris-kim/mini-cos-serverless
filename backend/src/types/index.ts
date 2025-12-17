import type { BoxState, ReturnCategory } from "../domain/orders/box.model";

export interface Address {
  line1: string;
  address?: string;
  city: string;
  province?: string;
  postal: string;
  lat: number;
  lng: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  homeAddress: Address;
  deliveryAddress: Address;
}

export interface Worker {
  id: string;
  name: string;

  role: "PICKER" | "PACKER" | "SHIPPER" | "DRIVER" | "QA";

  maxTasks?: number;
  currentTasks?: number;
  active?: boolean;
  capacity: number;
  currentLoad?: number;
  lastAssignedAt?: number;
  activeTasks?: number;

  warehouseId?: string;

  homeBase: Address;

  activeTaskIds?: string[];
 
  createdAt?: string;
  updatedAt?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: Address;
  inventory: Record<string, number>;
  region?: string;
  capacity?: number;
  activeWorkerCount?: number;
}

export interface Box {
  id: string;
  orderId: string;
  sku: string;
  state: string;
  warehouseId?: string;
}

export interface Task {
  id: string;
  orderId: string;
  boxId: string;
  warehouseId: string;
  workerId?: string | null;
  type: "PICK" | "PACK" | "SHIP";
  status: "PENDING" | "PENDING_PICK" | "IN_PROGRESS" | "DONE" | "FAILED";
  createdAt?: string;
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
  boxes: Box[];
  tasks?: Task[];
  status: string;
  createdAt: string;
}

// Optional shared view types
export type { BoxState, ReturnCategory };

export interface WarehouseInventoryItem {
  sku: string;
  warehouseId: string;
  currentStock: number;
  reorderPoint?: number;
  capacity?: number;
  lowStock: boolean;
}

export interface WarehouseWorkerActivity {
  workerId: string;
  warehouseId: string;
  activeTasks: number;
  completedTasksToday: number;
  capacity: number;
  utilization: number;
}

export interface WarehouseMetrics {
  warehouseId: string;
  timeRange: { from: string; to: string };
  ordersProcessedToday: number;
  tasksCompletedToday: number;
  avgPickTimeSeconds: number | null;
  avgPackTimeSeconds: number | null;
  avgShipTimeSeconds: number | null;
  avgOrderCycleTimeSeconds: number | null;
  sla: {
    onTimeShipRate7d: number | null;
    avgDeliveryDistanceKm7d: number | null;
  };
}

export interface WarehouseBackorderItem {
  id?: string;
  warehouseId: string;
  orderId: string;
  boxId: string;
  sku: string;
  requestedQty: number;
  status?: "OPEN" | "PARTIAL" | "FULFILLED" | "CANCELLED";
  createdAt: string;
  updatedAt?: string;
  reason: "INSUFFICIENT_STOCK";
  waitingSeconds?: number;
}

export interface BackorderSummary {
  totalOpenBackorders: number;
  totalBackorderedUnits: number;
  oldestOpenBackorderAgeMinutes: number | null;
  byWarehouse: Record<
    string,
    {
      openCount: number;
      openUnits: number;
      oldestOpenAgeMinutes: number | null;
    }
  >;
}

export interface WarehouseOpsSnapshot {
  warehouseId: string;
  warehouseName?: string;
  activeTasks: number;
  capacity: number;
  utilization: number;
  openBackorders: number;
  openBackorderedUnits: number;
  oldestBackorderAgeMinutes: number | null;
}

export interface SlaMetrics {
  avgTimeToPickMinutes: number | null;
  avgTimeToPackMinutes: number | null;
  avgTimeToShipMinutes: number | null;
  onTimeShipRate: number | null;
  p90TimeToShipMinutes?: number | null;
}

export interface ReturnRateBySku {
  sku: string;
  shippedBoxes: number;
  returnedBoxes: number;
  rate: number;
}

export interface ReturnRateByWarehouse {
  warehouseId: string;
  shippedBoxes: number;
  returnedBoxes: number;
  rate: number;
}

export interface ReturnMetrics {
  globalReturnRate: number | null;
  bySku: ReturnRateBySku[];
  byWarehouse: ReturnRateByWarehouse[];
}

export type WarehouseEventType =
  | "ORDER_CREATED"
  | "ORDER_ASSIGNED"
  | "ORDER_SHIPPED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_ASSIGNED"
  | "BACKORDER_CREATED"
  | "BACKORDER_CLEARED"
  | "INVENTORY_DECREASED"
  | "INVENTORY_INCREASED"
  | "WORKER_ASSIGNED"
  | "WORKER_UNASSIGNED"
  | "RETURN_RECEIVED"
  | "RETURN_QA_STARTED"
  | "RETURN_CLASSIFIED";

export interface WarehouseEvent {
  id: string;
  warehouseId: string;
  type: WarehouseEventType;
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
}
