import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { WarehouseEvent } from "../../types";
import { dynamo } from "../../lib/dynamo";
import { waitForPromise } from "../../lib/sync";

const DEFAULT_TABLE = "MiniCosWarehouseEvents";

export class DynamoWarehouseEventsRepo {
  private tableName = process.env.WAREHOUSE_EVENTS_TABLE || DEFAULT_TABLE;

  addEvent(event: WarehouseEvent): void {
    waitForPromise(
      dynamo.send(new PutCommand({ TableName: this.tableName, Item: event }))
    );
  }

  getEventsForWarehouse(warehouseId: string, limit = 50): WarehouseEvent[] {
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName }))
    );
    const events = (res.Items as WarehouseEvent[]) ?? [];
    const filtered =
      warehouseId === "ALL"
        ? events
        : events.filter((e) => e.warehouseId === warehouseId);
    return filtered
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}
