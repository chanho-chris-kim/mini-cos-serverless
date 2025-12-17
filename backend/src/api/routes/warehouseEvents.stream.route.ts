import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import type { Request, Response } from "express";
import { sseManager } from "../../domain/events/sseManager";
import type { RequestWithUser } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  "/stream",
  requireAuth,
  requireRole("ADMIN"),
  (req: Request, res: Response) => {
    sseManager.addClient("ALL", res, req.headers.origin as string | undefined);
    req.on("close", () => sseManager.removeClient("ALL", res));
  }
);

router.get(
  "/:id/events/stream",
  requireAuth,
  requireRole("ADMIN", "WAREHOUSE_MANAGER"),
  (req: Request, res: Response) => {
    const warehouseId = req.params.id;
    const user = (req as RequestWithUser).user;
    if (user?.role === "WAREHOUSE_MANAGER" && user.warehouseId !== warehouseId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    sseManager.addClient(warehouseId, res, req.headers.origin as string | undefined);
    req.on("close", () => sseManager.removeClient(warehouseId, res));
  }
);

export default router;
