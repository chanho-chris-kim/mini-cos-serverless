import type { Request, Response, NextFunction } from "express";

export function requireIntegrationToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["x-integration-key"];

  if (!token || token !== process.env.INTEGRATION_TOKEN) {
    return res.status(401).json({ error: "Invalid integration token" });
  }

  next();
}
