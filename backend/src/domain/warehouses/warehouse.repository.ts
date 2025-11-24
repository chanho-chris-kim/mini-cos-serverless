import { warehouses } from "../../data/warehouses";
import type { WarehouseEntity } from "./warehouse.model";

export class WarehouseRepository {
  getAll(): WarehouseEntity[] {
    return warehouses;
  }

  getById(id: string): WarehouseEntity | undefined {
    return warehouses.find((w) => w.id === id);
  }
}
