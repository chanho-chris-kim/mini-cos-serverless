import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { BoxEntity, ReturnCategory } from "./box.model";
import type { OrderEntity } from "./order.model";
import { dynamo } from "../../lib/dynamo";
import { waitForPromise } from "../../lib/sync";

const getTaskRepo = () => {
  // Lazy import to avoid circular dependencies during module initialization
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { taskRepo } = require("../sharedRepos") as typeof import("../sharedRepos");
  return taskRepo;
};

const DEFAULT_TABLE = "MiniCosOrders";

export class DynamoOrderRepo {
  private tableName = process.env.ORDERS_TABLE || DEFAULT_TABLE;

  listOrders(): OrderEntity[] {
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName }))
    );
    return (res.Items as OrderEntity[]) ?? [];
  }

  findById(id: string): OrderEntity | null {
    const res = waitForPromise(
      dynamo.send(new GetCommand({ TableName: this.tableName, Key: { id } }))
    );
    return (res.Item as OrderEntity) ?? null;
  }

  saveOrder(order: OrderEntity): void {
    waitForPromise(
      dynamo.send(new PutCommand({ TableName: this.tableName, Item: order }))
    );
  }

  updateOrder(order: OrderEntity): void {
    this.saveOrder(order);
  }

  createOrder(data: any): OrderEntity {
    const id = data.id ?? `O-${Date.now()}`;

    const newOrder: OrderEntity = {
      id,
      customerId: data.customerId ?? `C-${Date.now()}`,
      customerName: data.customerName ?? "Simulated Customer",
      createdAt: new Date().toISOString(),
      destination: data.destination,
      status: "PENDING",
      routes: data.routes ?? {},
      boxes: data.boxes ?? [],
    };

    this.saveOrder(newOrder);
    return newOrder;
  }

  listBoxes(): BoxEntity[] {
    return this.listOrders().flatMap((o) => o.boxes ?? []);
  }

  findOrderByBoxId(boxId: string): OrderEntity | null {
    return this.listOrders().find((o) => o.boxes.some((b) => b.id === boxId)) ?? null;
  }

  getBox(boxId: string): BoxEntity | null {
    for (const order of this.listOrders()) {
      const box = order.boxes.find((b) => b.id === boxId);
      if (box) return box;
    }
    return null;
  }

  updateBoxState(boxId: string, newState: BoxEntity["state"]): BoxEntity | null {
    const order = this.findOrderByBoxId(boxId);
    if (!order) return null;
    const box = order.boxes.find((b) => b.id === boxId);
    if (!box) return null;

    box.state = newState;
    this.saveOrder(order);
    return box;
  }

  classifyReturn(boxId: string, category: ReturnCategory, notes?: string) {
    const order = this.findOrderByBoxId(boxId);
    if (!order) return null;
    const box = order.boxes.find((b) => b.id === boxId);
    if (!box) return null;

    box.returnCategory = category;
    box.returnNotes = notes;
    box.state = "QA_DONE";
    this.saveOrder(order);
    return box;
  }

  async recomputeOrderStatus(orderId: string): Promise<string> {
    const order = this.findById(orderId);
    if (!order) throw new Error("Order not found");

    const tasks = await getTaskRepo().listTasks();
    const shipTasks = tasks.filter((t) => t.orderId === orderId && t.type === "SHIP");
    const allShipDone =
      shipTasks.length > 0 && shipTasks.every((t) => t.status === "DONE");

    if (allShipDone) {
      order.status = "FULFILLED";
    } else {
      order.status = "IN_PROGRESS";
    }

    this.saveOrder(order);
    return order.status;
  }

  seedIfEmpty(defaults: OrderEntity[] = []) {
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName, Limit: 1 }))
    );
    if ((res.Items?.length ?? 0) === 0 && defaults.length > 0) {
      defaults.forEach((order) => this.saveOrder(order));
    }
  }
}
