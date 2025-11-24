import { Router } from "express";
import {
  getTasks,
  updateTaskStatus,
  deleteTask,
} from "../controllers/tasks.controller";

const router = Router();

router.get("/", getTasks);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;
