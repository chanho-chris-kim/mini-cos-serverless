// ===============================
// Items
// ===============================
export interface Item {
  sku: string;
  qty: number;
}

// ===============================
// Address
// ===============================
export interface Address {
  line1: string;
  city: string;
  postal: string;
  lat: number;
  lng: number;
}

// ===============================
// Customer  
// ===============================
export interface Customer {
  id: string;
  name: string;
  email: string;
  homeAddress: Address;
  deliveryAddress?: Address; // optional
}

// ===============================
// Orders
// ===============================
export type OrderStatus =
  | "NEW"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELED"
  | "DELETED";

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: Item[];
  customer: Customer;
}

// ===============================
// Tasks
// ===============================
export type TaskType = "PICK" | "PACK" | "SHIP";

export type TaskStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "DELETED_ORDER";

export interface Task {
  id: string;
  type: TaskType;

  // The specific item for this task
  sku: string;
  qty: number;

  // Order relationship
  orderId: string;
  order?: Order; // optional full order reference

  // Worker assignment
  status: TaskStatus;
  worker?: string;
  assignedTo?: string;
}

// Optional helper – used in some API responses
export interface OrdersResponse {
  order: Order;
  tasks: Task[];
}

// ===============================
// Workers
// ===============================
export interface Worker {
  id: string;
  name: string;
  role: "Warehouse Picker" | "Delivery Specialist";
  maxTasks: number;
  currentTasks: number;
  homeBase: Address; // for distance algorithms later
}

// ===============================
// Warehouses
// ===============================
export interface Warehouse {
  id: string;
  name: string;
  location: Address;
  inventory: Record<string, number>; // SKU → qty
}
