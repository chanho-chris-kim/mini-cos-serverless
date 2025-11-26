// backend/src/data/orders.ts
import type { OrderEntity } from "../domain/orders/order.model";

export const orders: OrderEntity[] = [
  {
    id: "O-10021",
    customerId: "C-1",
    customerName: "Jane Doe",
    createdAt: "2025-11-20T14:42:00Z",
    status: "PARTIAL",
    routes: {
      wh1: ["B-1", "B-2"],
    },
    boxes: [
      {
        id: "B-1",
        orderId: "O-10021",
        sku: "COZEY001",
        state: "PACKED",
        warehouseId: "wh1",
      },
      {
        id: "B-2",
        orderId: "O-10021",
        sku: "COZEY002",
        state: "OUTBOUND",
        warehouseId: "wh1",
        trackingNumber: "1Z999999",
      },
    ],
  },
  {
    id: "O-10022",
    customerId: "C-2",
    customerName: "Alex Kim",
    createdAt: "2025-11-21T10:20:00Z",
    status: "PENDING",
    routes: {
      wh1: ["B-3"],
    },
    boxes: [
      {
        id: "B-3",
        orderId: "O-10022",
        sku: "COZEY003",
        state: "PENDING",
        warehouseId: "wh1",
      },
    ],
  },
  {
    id: "O-10023",
    customerId: "C-3",
    customerName: "Return Example",
    createdAt: "2025-11-22T09:00:00Z",
    status: "RETURNED",
    routes: {
      wh1: ["B-4"],
    },
    boxes: [
      {
        id: "B-4",
        orderId: "O-10023",
        sku: "COZEY004",
        state: "QA_PENDING",
        warehouseId: "wh1",
      },
    ],
  },
];
