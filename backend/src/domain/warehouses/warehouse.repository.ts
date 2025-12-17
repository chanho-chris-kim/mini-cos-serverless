// backend/src/domain/warehouses/warehouse.repository.ts
import type { WarehouseEntity } from "./warehouse.model";
import { INVENTORY } from "../../utils/inventory";
import { LOW_STOCK_THRESHOLD } from "../../config/inventoryThresholds";
import type { WarehouseInventoryItem } from "../../types";
import { eventLogger } from "../events/eventLogger.service";

let warehouses: WarehouseEntity[] = [];

export class WarehouseRepository {
  /**
   * Preferred API: return all warehouses.
   */
  listWarehouses(): WarehouseEntity[] {
    return warehouses;
  }

  /**
   * Backwards-compatible alias: some services still call repo.list()
   */
  list(): WarehouseEntity[] {
    return this.listWarehouses();
  }

  findById(id: string): WarehouseEntity | null {
    return warehouses.find((w) => w.id === id) || null;
  }

  save(warehouse: WarehouseEntity): void {
    const idx = warehouses.findIndex((w) => w.id === warehouse.id);
    if (idx === -1) warehouses.push(warehouse);
    else warehouses[idx] = warehouse;
  }

  seedIfEmpty(defaults: WarehouseEntity[] = []): void {
    if (!Array.isArray(defaults)) return;
    if (warehouses.length === 0 && defaults.length) {
      warehouses = [...defaults];
    }
  }

  // Convenience getters/setters used elsewhere
  getWarehouse(id: string): WarehouseEntity | null {
    return this.findById(id);
  }

  saveWarehouse(warehouse: WarehouseEntity): void {
    this.save(warehouse);
  }

  decrementInventory(warehouseId: string, sku: string): void {
    const wh = this.findById(warehouseId);
    if (!wh) return;
    const current = wh.inventory[sku] ?? 0;
    wh.inventory[sku] = Math.max(0, current - 1);
    if (wh.inventory[sku] <= LOW_STOCK_THRESHOLD) {
      console.warn(`[LOW STOCK] WH ${warehouseId} SKU ${sku} -> qty ${wh.inventory[sku]}`);
    }
    this.save(wh);
    eventLogger.log(
      warehouseId,
      "INVENTORY_DECREASED",
      `Inventory decreased for ${sku} -> ${wh.inventory[sku]}`,
      { sku, quantity: wh.inventory[sku] }
    );
  }

  incrementInventory(warehouseId: string, sku: string): void {
    const wh = this.findById(warehouseId);
    if (!wh) return;
    const current = wh.inventory[sku] ?? 0;
    wh.inventory[sku] = current + 1;
    this.save(wh);
    eventLogger.log(
      warehouseId,
      "INVENTORY_INCREASED",
      `Inventory increased for ${sku} -> ${wh.inventory[sku]}`,
      { sku, quantity: wh.inventory[sku] }
    );
  }

  getLowStock(
    threshold = LOW_STOCK_THRESHOLD
  ): Array<{ warehouseId: string; sku: string; quantity: number }> {
    const results: Array<{ warehouseId: string; sku: string; quantity: number }> = [];
    for (const wh of warehouses) {
      for (const [sku, qty] of Object.entries(wh.inventory ?? {})) {
        if ((qty as number) <= threshold) {
          results.push({ warehouseId: wh.id, sku, quantity: qty as number });
        }
      }
    }
    return results;
  }

  async getInventoryForWarehouse(warehouseId: string): Promise<WarehouseInventoryItem[]> {
    const wh = this.findById(warehouseId);
    if (!wh) return [];
    const heuristicReorderPoint = (stock: number) => Math.min(5, Math.max(1, Math.floor(stock / 10)));
    const items: WarehouseInventoryItem[] = [];
    for (const [sku, qty] of Object.entries(wh.inventory ?? {})) {
      const reorderPoint = heuristicReorderPoint(qty as number);
      items.push({
        sku,
        warehouseId,
        currentStock: qty as number,
        reorderPoint,
        capacity: undefined,
        lowStock: (qty as number) <= (reorderPoint ?? LOW_STOCK_THRESHOLD),
      });
    }
    return items;
  }
}
