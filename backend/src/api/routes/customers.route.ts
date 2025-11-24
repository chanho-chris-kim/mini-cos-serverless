import { Router } from "express";
import { getCustomers } from "../controllers/customers.controller";

const router = Router();

router.get("/", getCustomers);

export default router;
