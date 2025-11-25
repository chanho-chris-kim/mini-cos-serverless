import { Router } from "express";
import { scanReturnBox, classifyReturnBox } from "../controllers/returns.controller";

const router = Router();

// POST /returns/scan
router.post("/scan", scanReturnBox);

// POST /returns/:boxId/classify
router.post("/:boxId/classify", classifyReturnBox);

export default router;