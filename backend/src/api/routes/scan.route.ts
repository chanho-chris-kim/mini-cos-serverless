import { Router } from "express";
import { scanBox } from "../controllers/scan.controller";

const router = Router();

// POST /scan
router.post("/", scanBox);

export default router;
