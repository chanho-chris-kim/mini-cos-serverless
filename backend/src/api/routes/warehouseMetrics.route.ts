import { Router } from "express";
import {
  getWarehouseMetrics,
  getWarehouseBackorders,
} from "../controllers/warehouses.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  "/:id/metrics",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  getWarehouseMetrics
);

router.get(
  "/:id/backorders",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  getWarehouseBackorders
);

export default router;
