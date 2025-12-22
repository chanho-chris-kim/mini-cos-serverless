import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { WarehouseInventoryItem } from "../../types";
import { LOW_STOCK_THRESHOLD } from "../../config/inventoryThresholds";
import { eventLogger } from "../events/eventLogger.service";
import type { WarehouseEntity } from "./warehouse.model";
import { dynamo } from "../../lib/dynamo";
import { waitForPromise } from "../../lib/sync";

const DEFAULT_TABLE = "MiniCosWarehouses";

export class DynamoWarehouseRepo {
  private tableName = process.env.WAREHOUSES_TABLE || DEFAULT_TABLE;

  listWarehouses(): WarehouseEntity[] {
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName }))
    );
    return (res.Items as WarehouseEntity[]) ?? [];
  }

  list(): WarehouseEntity[] {
    return this.listWarehouses();
  }

  findById(id: string): WarehouseEntity | null {
    const res = waitForPromise(
      dynamo.send(new GetCommand({ TableName: this.tableName, Key: { id } }))
    );
    return (res.Item as WarehouseEntity) ?? null;
  }

  save(warehouse: WarehouseEntity): void {
    waitForPromise(
      dynamo.send(new PutCommand({ TableName: this.tableName, Item: warehouse }))
    );
  }

  seedIfEmpty(defaults: WarehouseEntity[] = []): void {
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName, Limit: 1 }))
    );
    if ((res.Items?.length ?? 0) === 0 && defaults.length > 0) {
      defaults.forEach((wh) => this.save(wh));
    }
  }

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
    this.save(wh);
    if (wh.inventory[sku] <= LOW_STOCK_THRESHOLD) {
      console.warn(`[LOW STOCK] WH ${warehouseId} SKU ${sku} -> qty ${wh.inventory[sku]}`);
    }
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
    for (const wh of this.listWarehouses()) {
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
