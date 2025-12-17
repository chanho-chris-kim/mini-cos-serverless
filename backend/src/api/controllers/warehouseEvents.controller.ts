import type { Request, Response } from "express";
import { warehouseEventsRepo } from "../../domain/sharedRepos";
import type { RequestWithUser } from "../../middleware/auth.middleware";

export const getWarehouseEvents = async (req: Request, res: Response) => {
  const { id } = req.params;
  const limit = Number(req.query.limit ?? 50) || 50;
  const user = (req as RequestWithUser).user;

  if (!user) return res.status(401).json({ error: "Not authenticated" });
  if (
    !(user.role === "ADMIN" || user.role === "OPS_MANAGER") &&
    !(user.role === "WAREHOUSE_MANAGER" && user.warehouseId === id)
  ) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const events = warehouseEventsRepo.getEventsForWarehouse(id, limit);
  return res.json({ warehouseId: id, events });
};
