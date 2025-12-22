import { OrderRepository as InMemoryOrderRepo } from "./orders/order.repository";
import { TaskRepository as InMemoryTaskRepo } from "./tasks/task.repository";
import { WorkerRepository as InMemoryWorkerRepo } from "./workers/worker.repository";
import { WarehouseRepository as InMemoryWarehouseRepo } from "./warehouses/warehouse.repository";
import { BackorderRepository as InMemoryBackorderRepo } from "./backorders/backorder.repository";
import { WarehouseEventsRepository as InMemoryWarehouseEventsRepo } from "./events/warehouseEvents.repository";
import { CustomerRepository as InMemoryCustomerRepo } from "./customers/customer.repository";
import { DynamoOrderRepo } from "./orders/order.dynamo.repository";
import { DynamoTaskRepo } from "./tasks/task.dynamo.repository";
import { DynamoWorkerRepo } from "./workers/worker.dynamo.repository";
import { DynamoWarehouseRepo } from "./warehouses/warehouse.dynamo.repository";
import { DynamoBackorderRepo } from "./backorders/backorder.dynamo.repository";
import { DynamoWarehouseEventsRepo } from "./events/warehouseEvents.dynamo.repository";
import { DynamoCustomerRepo } from "./customers/customer.dynamo.repository";
import { setWarehouseEventsRepo } from "./events/eventLogger.service";

export type PersistenceMode = "memory" | "dynamo";

export function getPersistenceMode(): PersistenceMode {
  const envMode = (process.env.PERSISTENCE_MODE || "").toLowerCase();
  if (envMode === "dynamo") return "dynamo";
  if (envMode === "memory") return "memory";
  if (process.env.NODE_ENV === "test" || process.env.IS_OFFLINE === "true") {
    return "memory";
  }
  return "memory";
}

const mode = getPersistenceMode();

export const orderRepo = mode === "dynamo" ? new DynamoOrderRepo() : new InMemoryOrderRepo();
export const taskRepo = mode === "dynamo" ? new DynamoTaskRepo() : new InMemoryTaskRepo();
export const workerRepo = mode === "dynamo" ? new DynamoWorkerRepo() : new InMemoryWorkerRepo();
export const warehouseRepo =
  mode === "dynamo" ? new DynamoWarehouseRepo() : new InMemoryWarehouseRepo();
export const backorderRepo =
  mode === "dynamo" ? new DynamoBackorderRepo() : new InMemoryBackorderRepo();
export const warehouseEventsRepo =
  mode === "dynamo"
    ? new DynamoWarehouseEventsRepo()
    : new InMemoryWarehouseEventsRepo();
export const customerRepo =
  mode === "dynamo" ? new DynamoCustomerRepo() : new InMemoryCustomerRepo();

setWarehouseEventsRepo(warehouseEventsRepo);
