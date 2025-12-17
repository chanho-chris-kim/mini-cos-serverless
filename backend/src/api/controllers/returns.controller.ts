// backend/src/api/controllers/returns.controller.ts
import type { Request, Response } from "express";
import { OrderService } from "../../domain/orders/order.service";
import { WarehouseService } from "../../domain/warehouses/warehouse.service";
import { ReturnsService } from "../../domain/returns/returns.service";
import { warehouseEventsRepo } from "../../domain/sharedRepos";

const orderService = new OrderService();
const warehouseService = new WarehouseService();
const returnsService = new ReturnsService();

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

/** GET /returns/all */
export const listAllReturns = async (_req: Request, res: Response) => {
  try {
    const items = await returnsService.listReturns();
    res.json(items);
  } catch (err: any) {
    console.error("listAllReturns failed:", err);
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

export const startQAForReturn = async (req: Request, res: Response) => {
  try {
    const { boxId } = req.params;
    const result = await returnsService.startQA(boxId);
    res.json(result);
  } catch (err: any) {
    console.error("startQA failed:", err);
    res.status(500).json({ error: err.message });
  }
};

export const restockReturn = async (req: Request, res: Response) => {
  try {
    const { boxId } = req.params;
    const box = await orderService.getBox(boxId);
    if (!box?.warehouseId) {
      return res.status(400).json({ error: "Missing warehouseId for restock" });
    }
    await warehouseService.incrementInventory(box.warehouseId, box.sku, 1);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("restock return failed:", err);
    res.status(500).json({ error: err.message });
  }
};

/** GET /returns/detail/:boxId */
export const getReturnDetail = async (req: Request, res: Response) => {
  try {
    const { boxId } = req.params;
    const box = await orderService.getBox(boxId);
    if (!box) return res.status(404).json({ error: "Return not found" });
    const order = await orderService.getOrder(box.orderId);

    const events = warehouseEventsRepo.getEventsForWarehouse("ALL", 1000).filter(
      (e) => e.meta?.boxId === boxId
    );

    const receivedAt = events.find((e) => e.type === "RETURN_RECEIVED")?.timestamp;
    const qaStartedAt = events.find((e) => e.type === "RETURN_QA_STARTED")?.timestamp;
    const classifiedAt = events.find((e) => e.type === "RETURN_CLASSIFIED")?.timestamp;
    const restockedAt = events.find((e) => e.type === "INVENTORY_INCREASED")?.timestamp;

    res.json({
      boxId: box.id,
      orderId: box.orderId,
      sku: box.sku,
      warehouseId: box.warehouseId,
      customerName: (order as any)?.customerName,
      destinationAddress:
        (order as any)?.destination?.address ??
        (order as any)?.destination?.line1 ??
        (order as any)?.destination?.street,
      state: box.state,
      category: (box as any).returnCategory,
      notes: (box as any).notes,
      events: events.map((e) => ({
        eventType: e.type,
        message: e.message,
        timestamp: e.timestamp,
      })),
      timeline: {
        receivedAt,
        qaStartedAt,
        classifiedAt,
        restockedAt,
      },
    });
  } catch (err: any) {
    console.error("getReturnDetail failed:", err);
    res.status(500).json({ error: err.message });
  }
};
