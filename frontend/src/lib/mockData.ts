import { Order, Task, User } from "./types";

export const mockUsers: User[] = [
  { id: "u1", name: "Ops Manager", role: "OPS_MANAGER" },
  {
    id: "u2",
    name: "MTL Manager",
    role: "WAREHOUSE_MANAGER",
    warehouseId: "W-MTL",
  },
  { id: "u3", name: "Picker A", role: "WORKER", warehouseId: "W-MTL" },
  { id: "u4", name: "QA B", role: "QA", warehouseId: "W-MTL" },
];

export const mockOrders: Order[] = [
  {
    id: "O-10021",
    customerName: "Jane Doe",
    createdAt: "2025-11-20T14:42:00Z",
    status: "PARTIAL",
    routes: { "W-MTL": ["B-1", "B-2"], "W-VAN": ["B-3"] },
    boxes: [
      { id: "B-1", sku: "SKU-SEAT-GRY", state: "PACKED", warehouseId: "W-MTL" },
      {
        id: "B-2",
        sku: "SKU-ARM-GRY",
        state: "OUTBOUND",
        warehouseId: "W-MTL",
        trackingNumber: "1Z999...",
      },
      {
        id: "B-3",
        sku: "SKU-OTTOMAN-GRY",
        state: "PICKED",
        warehouseId: "W-VAN",
      },
    ],
  },
  {
    id: "O-10022",
    customerName: "Alex Kim",
    createdAt: "2025-11-21T10:20:00Z",
    status: "PENDING",
    routes: { "W-MTL": ["B-4"] },
    boxes: [
      {
        id: "B-4",
        sku: "SKU-SEAT-BLK",
        state: "PENDING",
        warehouseId: "W-MTL",
      },
    ],
  },
];

export const mockTasks: Task[] = [
  {
    id: "T-1",
    warehouseId: "W-MTL",
    type: "PICK",
    status: "PENDING",
    boxId: "B-4",
    assignedTo: "u3",
    dueAt: "Today 4pm",
  },
  {
    id: "T-2",
    warehouseId: "W-MTL",
    type: "PACK",
    status: "IN_PROGRESS",
    boxId: "B-1",
    assignedTo: "u3",
    dueAt: "Today 5pm",
  },
  {
    id: "T-3",
    warehouseId: "W-MTL",
    type: "SHIP",
    status: "PENDING",
    boxId: "B-2",
    dueAt: "Today 6pm",
  },
  {
    id: "T-4",
    warehouseId: "W-MTL",
    type: "QA",
    status: "PENDING",
    boxId: "R-9",
    dueAt: "Tomorrow 10am",
  },
];
