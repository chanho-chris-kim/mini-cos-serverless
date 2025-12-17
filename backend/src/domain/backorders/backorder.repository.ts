import type { WarehouseBackorderItem } from "../../types";

// In-memory store for development; replace with DB in production.
let backorders: WarehouseBackorderItem[] = [];

export class BackorderRepository {
  add(item: WarehouseBackorderItem) {
    backorders.push(item);
  }

  listAll(): WarehouseBackorderItem[] {
    return [...backorders];
  }

  listByWarehouse(warehouseId: string): WarehouseBackorderItem[] {
    if (warehouseId === "ALL") return [...backorders];
    return backorders.filter((b) => b.warehouseId === warehouseId);
  }

  listOpen(): WarehouseBackorderItem[] {
    return backorders.filter((b) => b.status === "OPEN" || b.status === "PARTIAL");
  }

  listOpenByWarehouse(warehouseId: string): WarehouseBackorderItem[] {
    const open = this.listOpen();
    if (warehouseId === "ALL") return open;
    return open.filter((b) => b.warehouseId === warehouseId);
  }
}
