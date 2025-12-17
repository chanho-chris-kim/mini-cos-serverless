// backend/src/domain/warehouses/warehouse.service.ts
import { warehouseRepo } from "../sharedRepos";
import type { Warehouse } from "../../types";
import type { OrderEntity } from "../orders/order.model";

export class WarehouseService {
  private repo = warehouseRepo;

  /** --------------------------------
   * LIST ALL WAREHOUSES
   * -------------------------------- */
  async listWarehouses(): Promise<Warehouse[]> {
    return this.repo.listWarehouses();
  }

  /** --------------------------------
   * GET SINGLE WAREHOUSE
   * -------------------------------- */
  async getWarehouse(id: string): Promise<Warehouse | null> {
    return this.repo.findById(id);
  }

  /** --------------------------------
   * DETERMINE CLOSEST WAREHOUSE
   * FOR A GIVEN DELIVERY ADDRESS
   * -------------------------------- */
  async findClosestWarehouse(
    lat: number,
    lng: number
  ): Promise<Warehouse | null> {
    const warehouses = await this.repo.listWarehouses();
    if (warehouses.length === 0) return null;

    let best: Warehouse | null = null;
    let bestDist = Infinity;

    for (const wh of warehouses) {
      const d =
        Math.hypot(wh.location.lat - lat, wh.location.lng - lng) * 111_000; // meters
      if (d < bestDist) {
        bestDist = d;
        best = wh;
      }
    }

    return best;
  }

  /** --------------------------------
   * FIND WAREHOUSES WITH STOCK OF SKU
   * -------------------------------- */
  async findWarehousesWithStock(
    sku: string
  ): Promise<{ warehouse: Warehouse; qty: number }[]> {
    const warehouses = await this.repo.listWarehouses();
    const results: { warehouse: Warehouse; qty: number }[] = [];

    for (const wh of warehouses) {
      const qty = wh.inventory?.[sku] ?? 0;
      if (qty > 0) results.push({ warehouse: wh, qty });
    }

    return results;
  }

  /** --------------------------------
   * DECREMENT INVENTORY FOR BOX PICK
   * -------------------------------- */
  async decrement(warehouseId: string, sku: string): Promise<void> {
    await this.repo.decrementInventory(warehouseId, sku);
  }

  /** --------------------------------
   * INCREMENT INVENTORY (RETURNS)
   * -------------------------------- */
  async restock(warehouseId: string, sku: string): Promise<void> {
    await this.repo.incrementInventory(warehouseId, sku);
  }

  /** --------------------------------
   * MULTI-WAREHOUSE ROUTING ENGINE
   *
   * Determines which warehouse produces
   * each box for an order.
   *
   * Strategy:
   *   1. Prefer nearest warehouse
   *   2. If out of stock → fallback to next
   *   3. Returns an object:
   *         { [warehouseId]: [boxIds[]] }
   * -------------------------------- */
  async routeOrder(order: OrderEntity) {
    const routes: Record<string, string[]> = {};

    for (const box of order.boxes) {
      const warehouses = await this.findWarehousesWithStock(box.sku);

      if (warehouses.length === 0) {
        // Out-of-stock everywhere: mark unassigned
        continue;
      }

      // Sort by distance to delivery
      const sorted = warehouses.sort(
        (a, b) =>
          Math.hypot(a.warehouse.location.lat - order.customerLat!, a.warehouse.location.lng - order.customerLng!) -
          Math.hypot(b.warehouse.location.lat - order.customerLat!, b.warehouse.location.lng - order.customerLng!)
      );

      const selected = sorted[0].warehouse;

      // Record routing
      if (!routes[selected.id]) routes[selected.id] = [];
      routes[selected.id].push(box.id);
    }

    return routes;
  }

  /** --------------------------------
   * LOW-STOCK REPORT
   * For dashboards
   * -------------------------------- */
  async getLowStockReport(threshold = 20) {
    const warehouses = await this.repo.listWarehouses();
    const results: any[] = [];

    for (const wh of warehouses) {
      for (const sku in wh.inventory) {
        const qty = wh.inventory[sku];
        if (qty < threshold) {
          results.push({
            warehouseId: wh.id,
            sku,
            qty,
          });
        }
      }
    }

    return results;
  }
}
