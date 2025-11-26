// backend/src/api/routes/analytics.route.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  getAnalyticsOverview,
  getOrdersByStatus,
  getTasksByStatus,
  getReturnAnalytics,
} from "../controllers/analytics.controller";

const router = Router();

router.get(
  "/overview",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "ANALYTICS"),
  getAnalyticsOverview
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

export default router;
