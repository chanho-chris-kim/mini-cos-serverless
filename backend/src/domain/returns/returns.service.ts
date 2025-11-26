// backend/src/domain/returns/returns.service.ts

import { OrderRepository } from "../orders/order.repository";
import { WarehouseService } from "../warehouses/warehouse.service";
import type { ReturnCategory } from "../orders/box.model";

export class ReturnsService {
  private orderRepo = new OrderRepository();
  private warehouseService = new WarehouseService();

  /** --------------------------------
   * RECEIVE RETURN PACKAGE
   *
   * Sets box state → RETURN_RECEIVED
   * -------------------------------- */
  async intakeReturn(boxId: string, warehouseId: string) {
    const box = await this.orderRepo.getBox(boxId);
    if (!box) throw new Error("Box not found");

    // Update box location
    box.warehouseId = warehouseId;

    await this.orderRepo.updateBoxState(boxId, "RETURN_RECEIVED");

    return {
      boxId,
      orderId: box.orderId,
      sku: box.sku,
      state: "RETURN_RECEIVED",
      warehouseId,
    };
  }

  /** --------------------------------
   * START QA
   *
   * Marks box as under inspection
   * -------------------------------- */
  async startQA(boxId: string) {
    const box = await this.orderRepo.getBox(boxId);
    if (!box) throw new Error("Box not found");

    await this.orderRepo.updateBoxState(boxId, "QA_IN_PROGRESS");

    return {
      boxId,
      orderId: box.orderId,
      sku: box.sku,
      state: "QA_IN_PROGRESS",
    };
  }

  /** --------------------------------
   * FINISH QA → returnCategory to be applied
   * -------------------------------- */
  async classify(
    boxId: string,
    category: ReturnCategory,
    notes?: string
  ) {
    const updated = await this.orderRepo.classifyReturn(
      boxId,
      category,
      notes
    );

    if (!updated) throw new Error("Failed to classify return");

    // Restock if appropriate
    if (
      category === "FULL_PRICE" ||
      category === "DISCOUNT"
    ) {
      if (!updated.warehouseId) {
        console.warn("Return has no warehouseId to restock");
      } else {
        await this.warehouseService.restock(updated.warehouseId, updated.sku);
      }
    }

    return {
      boxId,
      orderId: updated.orderId,
      sku: updated.sku,
      category,
      notes,
      newState: "RETURN_CLASSIFIED",
    };
  }

  /** --------------------------------
   * LIST ALL RETURNED BOXES
   * (for dashboards)
   * -------------------------------- */
  async listReturns() {
    const boxes = await this.orderRepo.listBoxes();
    return boxes.filter((b) =>
      [
        "RETURN_RECEIVED",
        "QA_PENDING",
        "QA_IN_PROGRESS",
        "QA_DONE",
        "RETURN_CLASSIFIED",
      ].includes(b.state)
    );
  }

  /** --------------------------------
   * GET RETURN HISTORY FOR ORDER
   * -------------------------------- */
  async getReturnsForOrder(orderId: string) {
    const boxes = await this.orderRepo.listBoxes();
    return boxes.filter((b) => b.orderId === orderId);
  }
}
