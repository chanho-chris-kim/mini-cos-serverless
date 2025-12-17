// backend/src/api/routes/integrations.route.ts
import { Router } from "express";
import { createExternalOrder } from "../controllers/integrations.controller";

const router = Router();

// Public (but protected by x-integration-key)
router.post("/orders", createExternalOrder);

export default router;
