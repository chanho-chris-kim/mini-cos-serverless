import { Router } from "express";
import { assignTasks } from "../controllers/assignment.controller";

const router = Router();

router.post("/", assignTasks);

export default router;
