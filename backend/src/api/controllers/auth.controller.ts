import type { Request, Response } from "express";
import { AuthService } from "../../domain/auth/auth.service";

const authService = new AuthService();

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const result = await authService.login(email, password);
    return res.json(result);
  } catch (err: any) {
    console.error("Login failed:", err);
    return res.status(401).json({ error: "Invalid email or password" });
  }
};
