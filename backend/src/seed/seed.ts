// backend/src/seed/seed.ts
import { warehouseSeed } from "./warehouses.seed";
import { workerSeed } from "./workers.seed";

import { warehouseRepo, workerRepo, orderRepo, taskRepo } from "../domain/sharedRepos";

export function runAllSeeds() {
  console.log("🌱 Running Mini-COS seeds...");

  warehouseRepo.seedIfEmpty(warehouseSeed);
  workerRepo.seedIfEmpty(workerSeed);
  orderRepo.seedIfEmpty?.();
  taskRepo.seedIfEmpty?.();

  // (Products and future seeds go here)
  console.log("🌱 Seeding complete!");
}
