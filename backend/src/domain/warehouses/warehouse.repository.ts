// backend/src/domain/warehouses/warehouse.repository.ts

import { warehouses } from "../../data/warehouses";
import type { Warehouse } from "../../types";

export class WarehouseRepository {
  async listWarehouses(): Promise<Warehouse[]> {
    return warehouses;
  }

  async findById(id: string): Promise<Warehouse | null> {
    return warehouses.find(w => w.id === id) || null;
  }

  async saveWarehouse(wh: Warehouse) {
    const idx = warehouses.findIndex(w => w.id === wh.id);
    if (idx === -1) warehouses.push(wh);
    else warehouses[idx] = wh;
  }

  seedIfEmpty() {
    if (warehouses.length > 0) return;

    warehouses.push({
      id: "wh1",
      name: "Montreal Main Warehouse",
      location: {
        line1: "600 Logistics Dr",
        city: "Montreal",
        postal: "H4T 1J4",
        lat: 45.5088,
        lng: -73.6530,
      },
      inventory: {
        "QWRERTDS": 120,
        "ASDFDGQ": 80,
        "ASDF": 300,
        "COZEY001": 55
      }
    });
  }
}
