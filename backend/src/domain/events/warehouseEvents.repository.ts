import type { WarehouseEvent } from "../../types";

export class WarehouseEventsRepository {
  private events: WarehouseEvent[] = [];

  addEvent(event: WarehouseEvent): void {
    this.events.push(event);
  }

  getEventsForWarehouse(warehouseId: string, limit = 50): WarehouseEvent[] {
    const filtered =
      warehouseId === "ALL"
        ? this.events
        : this.events.filter((e) => e.warehouseId === warehouseId);
    return filtered
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const warehouseEventsRepo = new WarehouseEventsRepository();
