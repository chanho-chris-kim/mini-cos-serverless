// backend/src/api/controllers/warehouses.controller.ts

import type { Request, Response } from "express";
import { WarehouseRepository } from "../../domain/warehouses/warehouse.repository";

const repo = new WarehouseRepository();

/** --------------------------------
 * GET /warehouses
 * -------------------------------- */
export const getWarehouses = async (_req: Request, res: Response) => {
  try {
    const warehouses = await repo.listWarehouses();
    res.json(warehouses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * GET /warehouses/:id
 * -------------------------------- */
export const getWarehouseById = async (req: Request, res: Response) => {
  try {
    const wh = await repo.getWarehouse(req.params.id);
    if (!wh) return res.status(404).json({ error: "Warehouse not found" });
    res.json(wh);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** --------------------------------
 * POST /warehouses
 * Body: { id, name, location, inventory }
 * -------------------------------- */
export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const warehouse = req.body;

    if (!warehouse.id || !warehouse.name || !warehouse.location) {
      return res.status(400).json({
        error: "id, name, and location are required",
      });
    }

    await repo.saveWarehouse(warehouse);

    res.status(201).json(warehouse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
