// backend/src/middleware/integrationAuth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { INTEGRATION_TOKEN } from "../config/env";

/**
 * Lightweight auth for system-to-system integrations (e.g. Shopify, ecom).
 * Clients must send:
 *   x-integration-key: <INTEGRATION_TOKEN>
 *
 * This is *not* used by your React app. React uses normal JWT via /auth/login.
 */
export function requireIntegrationKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!INTEGRATION_TOKEN) {
    console.error(
      "[integration-auth] INTEGRATION_TOKEN is not configured on the server"
    );
    return res
      .status(500)
      .json({ error: "Integration not configured on this environment" });
  }

  const header =
    req.header("x-integration-key") || req.header("X-Integration-Key") || "";

  if (!header) {
    return res
      .status(401)
      .json({ error: "Missing x-integration-key header for integration" });
  }

  if (header !== INTEGRATION_TOKEN) {
    console.warn("[integration-auth] Invalid integration key used");
    return res.status(401).json({ error: "Invalid integration key" });
  }

  return next();
}
