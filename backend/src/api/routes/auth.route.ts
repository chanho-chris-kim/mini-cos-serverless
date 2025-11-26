import { Router } from "express";
import { login } from "../controllers/auth.controller";

const router = Router();

// No auth required for login
router.post("/login", login);

export default router;
