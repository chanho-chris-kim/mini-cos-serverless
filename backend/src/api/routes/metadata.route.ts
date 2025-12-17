import { Router } from "express";
import { ALL_SKUS } from "../../utils/skuList";

const router = Router();

router.get("/skus", (_req, res) => {
  res.json({ skus: ALL_SKUS });
});

export default router;
