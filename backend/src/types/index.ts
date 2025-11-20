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
    createdAt: string;
    status: OrderStatus;
    items: Item[];
    customer: Customer;
  }
  
  export type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELED" | "DELETED";
  
  // --- Tasks ---
  export interface Task {
    id: string;
    type: TaskType;
    sku: string;
    qty: number;
    orderId: string;
    status: TaskStatus;
    order?: Order;      // optional reference to full order
    worker?: string;    // assigned worker
    assignedTo?: string; // optional, used internally
  }
  
  export type TaskType = "PICK" | "PACK" | "SHIP";
  export type TaskStatus =
    | "PENDING"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELED"
    | "DELETED_ORDER";
  
  // --- Optional helper types for API responses ---
  export interface OrdersResponse {
    order: Order;
    tasks: Task[];
  }
  