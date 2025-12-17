import { Router } from "express";
import { warehouseRepo } from "../../domain/sharedRepos";
import { LOW_STOCK_THRESHOLD } from "../../config/inventoryThresholds";

const router = Router();

router.get("/", (_req, res) => {
  const warehouses = warehouseRepo.listWarehouses();
  const payload = warehouses.map((w) => {
    const lowStock =
      Object.entries(w.inventory ?? {}).filter(
        ([, qty]) => (qty as number) <= LOW_STOCK_THRESHOLD
      ).map(([sku, qty]) => ({ sku, qty }));
    return { warehouseId: w.id, lowStock };
  });

  res.json(payload);
});

export default router;
