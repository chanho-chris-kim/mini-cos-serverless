import type { OrderEntity } from "../domain/orders/order.model";

export const orders: OrderEntity[] = [
  {
    id: "O-10021",
    customerId: "c1",
    createdAt: new Date().toISOString(),
    status: "PARTIAL",
    routes: { wh1: ["B-1", "B-2"] },
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
        sku: "ASDF",
        state: "OUTBOUND",
        warehouseId: "wh1",
        trackingNumber: "1Z999-DEMO",
      },
    ],
  },
  {
    id: "O-10022",
    customerId: "c2",
    createdAt: new Date().toISOString(),
    status: "PENDING",
    routes: { wh1: ["B-3"] },
    boxes: [
      {
        id: "B-3",
        orderId: "O-10022",
        sku: "QWRERTDS",
        state: "PENDING",
        warehouseId: "wh1",
      },
    ],
  },
];