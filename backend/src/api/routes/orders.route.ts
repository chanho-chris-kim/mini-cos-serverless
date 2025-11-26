import { Router } from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orders.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole(
    "ADMIN",
    "OPS_MANAGER",
    "WAREHOUSE_MANAGER",
    "SUPPORT",
    "ANALYTICS"
  ),
  getOrders
);

router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "SUPPORT"),
  getOrderById
);
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "SUPPORT"),
  createOrder
);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "SUPPORT"),
  updateOrderStatus
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "SUPPORT"),
  deleteOrder
);

export default router;
