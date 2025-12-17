// backend/src/seed/workers.seed.ts
import type { WorkerEntity } from "../domain/workers/worker.model";
import { warehouseSeed } from "./warehouses.seed";

const roles = [
  "PICKER", "PICKER", "PICKER", "PICKER",
  "PACKER", "PACKER", "PACKER",
  "SHIPPER", "SHIPPER",
  "QA"
];

export const workerSeed: WorkerEntity[] = warehouseSeed.flatMap((wh) => {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `${wh.id}-W${i + 1}`,
    name: `Worker ${wh.id}-${i + 1}`,
    role: roles[i] as WorkerEntity["role"],
    zone: roles[i] === "QA" ? "QA" : roles[i] === "PACKER" ? "PACKING" : "PICKING",
    currentTasks: 0,
    maxTasks: roles[i] === "QA" ? 5 : roles[i] === "PICKER" ? 12 : 8,
    capacity: roles[i] === "QA" ? 5 : roles[i] === "PICKER" ? 12 : 8,
    currentLoad: 0,
    lastAssignedAt: 0,
    active: true,
    warehouseId: wh.id,
    homeBase: {
      line1: "N/A",
      city: wh.location.city,
      postal: wh.location.postal,
      lat: wh.location.lat + (Math.random() - 0.5) * 0.03,
      lng: wh.location.lng + (Math.random() - 0.5) * 0.03,
    },
    activeTaskIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
});
