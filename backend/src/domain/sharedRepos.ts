import { OrderRepository } from "./orders/order.repository";
import { TaskRepository } from "./tasks/task.repository";
import { WorkerRepository } from "./workers/worker.repository";
import { WarehouseRepository } from "./warehouses/warehouse.repository";
import { BackorderRepository } from "./backorders/backorder.repository";
import { warehouseEventsRepo } from "./events/warehouseEvents.repository";

export const orderRepo = new OrderRepository();
export const taskRepo = new TaskRepository();
export const workerRepo = new WorkerRepository();
export const warehouseRepo = new WarehouseRepository();
export const backorderRepo = new BackorderRepository();
export { warehouseEventsRepo };
