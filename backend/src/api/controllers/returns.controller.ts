// backend/src/api/controllers/returns.controller.ts
import type { Request, Response } from "express";
import { OrderService } from "../../domain/orders/order.service";
import { WarehouseService } from "../../domain/warehouses/warehouse.service";

const orderService = new OrderService();
const warehouseService = new WarehouseService();

/** GET /returns */
export const listReturns = async (_req: Request, res: Response) => {
  try {
    const boxes = await orderService.getReturnCandidates();
    res.json(boxes);
  } catch (err: any) {
    console.error("listReturns failed:", err);
    res.status(500).json({ error: err.message });
  }
};

/** POST /returns/scan */
export const scanReturn = async (req: Request, res: Response) => {
  try {
    const { boxId, userId, warehouseId } = req.body;

    if (!boxId || !userId || !warehouseId) {
      return res.status(400).json({
        error: "boxId, userId, and warehouseId are required",
      });
    }

    const updated = await orderService.processReturnCheckIn({
      boxId,
      warehouseId,
      userId,
    });

    return res.json(updated);
  } catch (err: any) {
    console.error("Return scan failed:", err);
    return res.status(500).json({ error: err.message });
  }
};

/** POST /returns/:boxId/classify */
export const classifyReturn = async (req: Request, res: Response) => {
  try {
    const { boxId } = req.params;
    const { category, notes } = req.body;

    if (!category) {
      return res.status(400).json({
        error: "Return category is required",
      });
    }

    const updatedBox = await orderService.classifyReturn({
      boxId,
      category,
      notes,
    });

    // Only add back to inventory if not trash/salvage
    if (["FULL_PRICE", "DISCOUNT", "REFURBISH"].includes(category)) {
      if (!updatedBox.warehouseId) {
        throw new Error("Cannot restock return: missing warehouseId");
      }
      await warehouseService.incrementInventory(
        updatedBox.warehouseId,
        updatedBox.sku,
        1
      );
    }

    return res.json(updatedBox);
  } catch (err: any) {
    console.error("Return classification failed:", err);
    return res.status(500).json({ error: err.message });
  }
};
