import { Router } from "express";
import { getWorkers } from "../controllers/workers.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN", "OPS_MANAGER"), getWorkers);

export default router;
