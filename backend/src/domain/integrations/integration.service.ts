// backend/src/domain/integrations/integration.service.ts
import { orderRepo, taskRepo } from "../sharedRepos";
import type { OrderEntity } from "../orders/order.model";
import type { TaskEntity } from "../tasks/task.model";

export interface ExternalOrderItem {
  sku: string;
  qty: number;
  unitPrice: number;
  currency: string;
}

export interface ExternalOrderPayload {
  externalOrderId: string;
  customerName: string;
  customerEmail: string;
  deliveryCity: string;
  deliveryPostal: string;
  deliveryLine1?: string;
  country?: string;
  items: ExternalOrderItem[];
  source?: string;
}

/**
 * Service that turns an external “Shopify-like” order payload
 * into a real internal COS order + tasks.
 */
export class IntegrationOrderService {
  async createCOSOrderFromExternal(
    payload: ExternalOrderPayload
  ): Promise<OrderEntity> {
    if (!payload.items || payload.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    const now = new Date().toISOString();
    const orderId = `ord_${Date.now()}`;
    const warehouseId = "wh1"; // For now: always route to main CA warehouse

    // Build boxes (one box per line item for the simulator)
    const boxes = payload.items.map((item, index) => ({
      id: `box_${orderId}_${index + 1}`,
      orderId,
      sku: item.sku,
      qty: item.qty,
      warehouseId,
      state: "PENDING_PICK", // compatible with our task model
    })) as any[];

    const totalAmount = payload.items.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0
    );

    // Internal COS order object.
    // We keep the type loose on purpose so we don't fight with existing types.
    const order: any = {
      id: orderId,
      externalOrderId: payload.externalOrderId,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      deliveryCity: payload.deliveryCity,
      deliveryPostal: payload.deliveryPostal,
      deliveryLine1: payload.deliveryLine1 ?? "Unknown address line",
      country: payload.country ?? "CA",
      source: payload.source ?? "external",

      warehouseId,
      status: "PENDING_PICK", // initial status for new orders

      boxes,
      totalAmount,
      currency: payload.items[0]?.currency ?? "CAD",

      createdAt: now,
      updatedAt: now,
    };

    // Persist in our in-memory order store
    await orderRepo.saveOrder(order as OrderEntity);

    // Generate one PICK task per box.
    for (const box of boxes) {
      const task: any = {
        id: `task_${box.id}`,
        orderId,
        boxId: box.id,
        warehouseId,
        workerId: null, // will be assigned by /assign/auto
        status: "PENDING_PICK",
        type: "PICK",
        createdAt: now,
      };

      await taskRepo.saveTask(task as TaskEntity);
    }

    return order as OrderEntity;
  }
}
