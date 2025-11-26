import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../domain/auth/auth.service";

const authService = new AuthService();

export interface RequestWithUser extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
    warehouseId?: string;
    workerId?: string;
  };
}

/**
 * Basic JWT authentication middleware.
 * Reads Authorization: Bearer <token>
 */
export function requireAuth(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.substring("Bearer ".length);

  try {
    const claims = authService.verifyToken(token);
    req.user = claims;
    return next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Role-based guard.
 * Example: router.get("/orders", requireAuth, requireRole("ADMIN", "OPS_MANAGER"), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    return next();
  };
}
