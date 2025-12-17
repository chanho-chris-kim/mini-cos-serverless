// backend/src/api/routes/simulator.route.ts
import { Router } from "express";
import {
  generateSimulatedOrder,
  getRandomDestination,
} from "../controllers/simulator.controller";
import { devBypassAuth } from "../../middleware/devBypass.middleware";

const router = Router();

// Simulator uses x-simulator-key instead of JWT; do not bypass with dev auth
router.post("/orders", devBypassAuth, generateSimulatedOrder);
router.get("/random-destination", getRandomDestination);

export default router;
