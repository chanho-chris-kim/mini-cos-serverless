// backend/src/api/routes/returns.route.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  listReturns,
  scanReturn,
  classifyReturn,
} from "../controllers/returns.controller";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("WAREHOUSE_MANAGER", "WORKER", "OPS_MANAGER"),
  listReturns
);
router.post(
  "/scan",
  requireAuth,
  requireRole("WAREHOUSE_MANAGER", "WORKER", "OPS_MANAGER"),
  scanReturn
);
router.post(
  "/:boxId/classify",
  requireAuth,
  requireRole("QA", "WAREHOUSE_MANAGER", "OPS_MANAGER"),
  classifyReturn
);

export default router;
