import { Request, Response } from "express";
import { WarehouseService } from "../../domain/warehouses/warehouse.service";

const service = new WarehouseService();

export const getWarehouses = (_req: Request, res: Response) => {
  res.json(service.getAll());
};
