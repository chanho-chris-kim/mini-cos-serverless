// --- Items in an order ---
export interface Item {
  sku: string;
  qty: number;
}

// --- Customer ---
export interface Customer {
  name: string;
}

// --- Orders ---
export interface Order {
  id: string;
  customer: Customer;
  items: Item[];
  status: OrderStatus;
}

export type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELED" | "DELETED";

// --- Tasks ---
export interface Task {
  id: string;
  order: Order;
  status: TaskStatus;
  worker?: string;      // assigned worker
  assignedTo?: string;  // optional internal assignment
}

export type TaskStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "DELETED_ORDER";
