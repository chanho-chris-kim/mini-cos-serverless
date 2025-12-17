import { Router } from "express";
import { getWarehouseEvents } from "../controllers/warehouseEvents.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  "/:id/events",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  getWarehouseEvents
);

export default router;
