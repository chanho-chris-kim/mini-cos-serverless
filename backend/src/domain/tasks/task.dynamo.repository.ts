import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { TaskEntity, TaskStatus } from "./task.model";
import { dynamo } from "../../lib/dynamo";
import { waitForPromise } from "../../lib/sync";

const getOrderRepo = () => {
  // Lazy import to avoid circular dependencies during module initialization
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { orderRepo } = require("../sharedRepos") as typeof import("../sharedRepos");
  return orderRepo;
};

const DEFAULT_TABLE = "MiniCosTasks";

export class DynamoTaskRepo {
  private tableName = process.env.TASKS_TABLE || DEFAULT_TABLE;

  async listTasks(): Promise<TaskEntity[]> {
    const res = await dynamo.send(new ScanCommand({ TableName: this.tableName }));
    return (res.Items as TaskEntity[]) ?? [];
  }

  async countActiveTasksForWarehouse(warehouseId: string): Promise<number> {
    const tasks = await this.listTasks();
    return tasks.filter((t) => t.warehouseId === warehouseId && t.status !== "DONE").length;
  }

  async listTasksForWorker(workerId: string): Promise<TaskEntity[]> {
    const tasks = await this.listTasks();
    return tasks.filter((t) => t.workerId === workerId);
  }

  async getTask(taskId: string): Promise<TaskEntity | null> {
    const res = await dynamo.send(
      new GetCommand({ TableName: this.tableName, Key: { id: taskId } })
    );
    return (res.Item as TaskEntity) ?? null;
  }

  async saveTask(task: TaskEntity): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: this.tableName, Item: task }));
  }

  async createTask(task: TaskEntity): Promise<TaskEntity> {
    await this.saveTask(task);
    return task;
  }

  async upsertMany(newTasks: TaskEntity[]): Promise<void> {
    for (const t of newTasks) {
      await this.saveTask(t);
    }
  }

  async updateTaskStatus(
    taskId: string,
    newStatus: TaskStatus
  ): Promise<TaskEntity> {
    return this.updateStatus(taskId, newStatus);
  }

  async updateStatus(
    taskId: string,
    newStatus: TaskStatus
  ): Promise<TaskEntity> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error("Task not found");

    task.status = newStatus;
    await this.saveTask(task);

    await this.updateBoxStateForTask(task, newStatus);
    return task;
  }

  async assignWorker(taskId: string, workerId: string): Promise<TaskEntity> {
    const task = await this.getTask(taskId);
    if (!task) throw new Error("Task not found");

    task.workerId = workerId;

    if (task.status === "PENDING_PICK") {
      return this.updateStatus(task.id, "IN_PROGRESS");
    }

    await this.saveTask(task);
    return task;
  }

  seedIfEmpty(defaults: TaskEntity[] = []): void {
    const res = waitForPromise(
      dynamo.send(new ScanCommand({ TableName: this.tableName, Limit: 1 }))
    );
    if ((res.Items?.length ?? 0) === 0 && defaults.length > 0) {
      defaults.forEach((t) =>
        waitForPromise(dynamo.send(new PutCommand({ TableName: this.tableName, Item: t })))
      );
    }
  }

  async countByStatus(): Promise<Record<TaskStatus, number>> {
    const tasks = await this.listTasks();
    const result = {} as Record<TaskStatus, number>;
    for (const t of tasks) {
      result[t.status] = (result[t.status] ?? 0) + 1;
    }
    return result;
  }

  private async updateBoxStateForTask(task: TaskEntity, status: TaskStatus) {
    const order = getOrderRepo().findById(task.orderId);
    if (!order) return;

    const box = order.boxes.find((b) => b.id === task.boxId);
    if (!box) return;

    if (status === "IN_PROGRESS") {
      box.state = "PICK_ASSIGNED";
    } else if (status === "DONE") {
      if (task.type === "PICK" || !task.type) box.state = "PICKED";
      else if (task.type === "PACK") box.state = "PACKED";
      else if (task.type === "SHIP") box.state = "OUTBOUND";
    }

    getOrderRepo().saveOrder(order);
    await getOrderRepo().recomputeOrderStatus(order.id);

    const tasksForBox = (await this.listTasks()).filter(
      (t) => t.orderId === task.orderId && t.boxId === task.boxId
    );
    if (task.type === "PICK" && status === "DONE") {
      const next = tasksForBox.find(
        (t) => t.type === "PACK" && t.status === "PENDING"
      );
      if (next) {
        next.status = "PENDING_PICK";
        await this.saveTask(next);
      }
    } else if (task.type === "PACK" && status === "DONE") {
      const next = tasksForBox.find(
        (t) => t.type === "SHIP" && t.status === "PENDING"
      );
      if (next) {
        next.status = "PENDING_PICK";
        await this.saveTask(next);
      }
    } else if (task.type === "SHIP" && status === "DONE") {
      const order2 = getOrderRepo().findById(task.orderId);
      if (order2) {
        const b = order2.boxes.find((bx) => bx.id === task.boxId);
        if (b) b.state = "DELIVERED";
        getOrderRepo().saveOrder(order2);
        await getOrderRepo().recomputeOrderStatus(order2.id);
      }
    }
  }
}
