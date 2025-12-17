import { Router } from "express";
import { getOpsSummary, getOpsExceptions } from "../controllers/ops.controller";
import { getBackorderMetrics } from "../controllers/ops.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";

const router = Router();

router.get("/summary", requireAuth, requireRole("ADMIN"), getOpsSummary);
router.get("/exceptions", requireAuth, requireRole("ADMIN"), getOpsExceptions);
router.get("/backorders/summary", requireAuth, requireRole("ADMIN"), getBackorderMetrics);

export default router;
