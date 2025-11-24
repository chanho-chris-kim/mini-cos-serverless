import type { Warehouse } from "../../types";
import { WarehouseRepository } from "./warehouse.repository";

export class WarehouseService {
  private repo = new WarehouseRepository();

  getAll(): Warehouse[] {
    return this.repo.getAll();
  }
}
