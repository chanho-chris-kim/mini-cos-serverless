import type { BoxEntity } from "../orders/box.model";
import type { WarehouseEntity } from "../warehouses/warehouse.model";

export function reserveStock(
  warehouse: WarehouseEntity,
  sku: string,
  qty: number
): boolean {
  const available = warehouse.inventory[sku] ?? 0;
  if (available < qty) {
    return false;
  }
  warehouse.inventory[sku] = available - qty;
  return true;
}

export function consumeReservedStock(
  box: BoxEntity,
  _warehouse: WarehouseEntity
) {
  // Reservation already deducted; consuming just clears the reserved amount
  box.reservedQty = 0;
}

export function restoreReservedStock(
  box: BoxEntity,
  warehouse: WarehouseEntity
) {
  if (!box.reservedQty || box.reservedQty <= 0) return;
  warehouse.inventory[box.sku] =
    (warehouse.inventory[box.sku] ?? 0) + box.reservedQty;
  box.reservedQty = 0;
}

export function releaseReservedStock(order: { boxes: BoxEntity[] }) {
  order.boxes.forEach((box) => {
    // Warehouse lookup handled by callers
    // This helper only resets reserved qty
    if (box.reservedQty) {
      box.reservedQty = 0;
    }
  });
}
