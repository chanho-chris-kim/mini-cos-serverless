// backend/src/api/routes/analytics.route.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  getOverview,
  getOrdersByStatus,
  getTasksByStatus,
  getReturnAnalytics,
  getLowStock,
  getSlaMetrics,
  getReturnMetrics,
} from "../controllers/analytics.controller";

const router = Router();

router.get(
  "/overview",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "ANALYTICS"),
  getOverview
);
router.get(
  "/orders-status",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "ANALYTICS"),
  getOrdersByStatus
);
router.get(
  "/tasks-status",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "ANALYTICS"),
  getTasksByStatus
);
router.get(
  "/returns",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "ANALYTICS"),
  getReturnAnalytics
);
router.get(
  "/low-stock",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "ANALYTICS", "WAREHOUSE_MANAGER"),
  getLowStock
);
router.get(
  "/sla",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "ANALYTICS"),
  getSlaMetrics
);
router.get(
  "/returns/metrics",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "ANALYTICS"),
  getReturnMetrics
);

export default router;
