import { Router } from "express";
import { getWarehouses } from "../controllers/warehouses.controller";

const router = Router();

router.get("/", getWarehouses);

export default router;
