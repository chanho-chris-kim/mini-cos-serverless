import { Router } from "express";
import {
  getTasks,
  updateTaskStatus,
  deleteTask,
  getTasksForWorker,
} from "../controllers/tasks.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER", "ANALYTICS"),
  getTasks
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  updateTaskStatus
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  deleteTask
);
router.get(
  "/worker/:id",
  requireAuth,
  requireRole("ADMIN", "OPS_MANAGER", "WAREHOUSE_MANAGER"),
  getTasksForWorker
);

export default router;
