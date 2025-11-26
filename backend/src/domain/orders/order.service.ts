// backend/src/domain/orders/order.service.ts
import { OrderRepository } from "./order.repository";
import type { BoxEntity } from "./box.model";
import type { ReturnCategory } from "./box.model";

const repo = new OrderRepository();

export class OrderService {
  async listOrders() {
    return repo.listOrders();
  }

  async getOrder(id: string) {
    const order = await repo.findById(id);
    if (!order) throw new Error("Order not found");
    return order;
  }

  async updateStatusDerived(orderId: string) {
    return repo.recomputeOrderStatus(orderId);
  }

  /** Returns boxes that are in the returns/QA pipeline */
  async getReturnCandidates(): Promise<BoxEntity[]> {
    const boxes = await repo.listBoxes();
    return boxes.filter((b) =>
      ["QA_PENDING", "QA_IN_PROGRESS", "QA_DONE"].includes(b.state)
    );
  }

  /** Called by /returns/scan */
  async processReturnCheckIn(params: {
    boxId: string;
    warehouseId: string;
    userId: string;
  }) {
    const { boxId, warehouseId } = params;
    const box = await repo.updateBoxState(boxId, "QA_PENDING");
    if (!box) throw new Error("Box not found for return check-in");

    // ensure warehouse set
    if (!box.warehouseId) {
      box.warehouseId = warehouseId;
      const order = await repo.findOrderByBoxId(boxId);
      if (order) await repo.updateOrder(order);
    }

    // recompute order aggregate status
    await repo.recomputeOrderStatus(box.orderId);
    return { ...box, message: "Return received + QA pending" };
  }

  /** Called by /returns/:boxId/classify */
  async classifyReturn(params: {
    boxId: string;
    category: ReturnCategory;
    notes?: string;
  }) {
    const { boxId, category, notes } = params;
    const box = await repo.classifyReturn(boxId, category, notes);
    if (!box) throw new Error("Box not found for classification");

    await repo.recomputeOrderStatus(box.orderId);
    return box;
  }
}
