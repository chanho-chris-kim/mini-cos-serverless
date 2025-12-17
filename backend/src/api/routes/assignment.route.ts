import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { autoAssignAll, processIncomingOrder } from "../controllers/assignment.controller";

const router = Router();

// Real users with OPS or ADMIN permission
router.post(
  "/auto",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  autoAssignAll
);

// Simulator route
router.post(
  "/incoming",
  processIncomingOrder // intentionally NOT protected
);

export default router;
