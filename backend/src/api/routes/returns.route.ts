// backend/src/api/routes/returns.route.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  listReturns,
  listAllReturns,
  scanReturn,
  classifyReturn,
  startQAForReturn,
  restockReturn,
  getReturnDetail,
} from "../controllers/returns.controller";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "SUPPORT"),
  listReturns
);
router.post(
  "/scan",
  requireAuth,
  requireRole("WAREHOUSE_MANAGER", "WORKER", "OPS_MANAGER"),
  scanReturn
);
router.get(
  "/all",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "SUPPORT"),
  listAllReturns
);
router.post(
  "/:boxId/classify",
  requireAuth,
  requireRole("QA", "WAREHOUSE_MANAGER", "OPS_MANAGER"),
  classifyReturn
);
router.post(
  "/:boxId/start-qa",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "QA", "WAREHOUSE_MANAGER"),
  startQAForReturn
);
router.post(
  "/:boxId/restock",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  restockReturn
);
router.get(
  "/detail/:boxId",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "QA"),
  getReturnDetail
);

export default router;
