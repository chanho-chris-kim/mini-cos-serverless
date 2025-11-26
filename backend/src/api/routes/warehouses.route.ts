import { Router } from "express";
import { getWarehouses } from "../controllers/warehouses.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER"),
  getWarehouses
);

export default router;
