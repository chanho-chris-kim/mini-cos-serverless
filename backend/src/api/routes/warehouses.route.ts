import { Router } from "express";
import {
  getWarehouses,
  getWarehouseById,
  getWarehouseInventory,
  getWarehouseWorkers,
} from "../controllers/warehouses.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER"),
  getWarehouses
);

router.get(
  "/:id/inventory",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  getWarehouseInventory
);

router.get(
  "/:id/workers",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  getWarehouseWorkers
);

router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  getWarehouseById
);

export default router;
