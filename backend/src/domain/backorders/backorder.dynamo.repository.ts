import { randomUUID } from "crypto";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { WarehouseBackorderItem } from "../../types";
import { dynamo } from "../../lib/dynamo";
import { waitForPromise } from "../../lib/sync";

const DEFAULT_TABLE = "MiniCosBackorders";

export class DynamoBackorderRepo {
  private tableName = process.env.BACKORDERS_TABLE || DEFAULT_TABLE;

  add(item: WarehouseBackorderItem) {
    const payload = { id: item.id ?? randomUUID(), ...item };
    waitForPromise(
      dynamo.send(new PutCommand({ TableName: this.tableName, Item: payload }))
    );
  }

  listAll(): WarehouseBackorderItem[] {
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName }))
    );
    return (res.Items as WarehouseBackorderItem[]) ?? [];
  }

  listByWarehouse(warehouseId: string): WarehouseBackorderItem[] {
    if (warehouseId === "ALL") return this.listAll();
    return this.listAll().filter((b) => b.warehouseId === warehouseId);
  }

  listOpen(): WarehouseBackorderItem[] {
    return this.listAll().filter(
      (b) => b.status === "OPEN" || b.status === "PARTIAL"
    );
  }

  listOpenByWarehouse(warehouseId: string): WarehouseBackorderItem[] {
    const open = this.listOpen();
    if (warehouseId === "ALL") return open;
    return open.filter((b) => b.warehouseId === warehouseId);
  }
}
