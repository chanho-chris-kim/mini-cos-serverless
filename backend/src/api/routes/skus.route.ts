import { Router } from "express";
import { ALL_SKUS } from "../../utils/skuList";

const router = Router();

router.get("/", (_req, res) => {
  console.log("[SKUS ROUTE] returning", ALL_SKUS.length, "SKUs");
  res.json({ skus: ALL_SKUS });
});

export default router;
