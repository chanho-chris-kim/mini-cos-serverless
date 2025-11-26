// backend/src/api/index.ts
import { Router } from "express";
import ordersRouter from "./routes/orders.route";
import tasksRouter from "./routes/tasks.route";
import customersRouter from "./routes/customers.route";
import workersRouter from "./routes/workers.route";
import warehousesRouter from "./routes/warehouses.route";
import assignmentRouter from "./routes/assignment.route";
import scanRouter from "./routes/scan.route";
import returnsRouter from "./routes/returns.route";
import analyticsRouter from "./routes/analytics.route";
import authRouter from "./routes/auth.route";
import { requireAuth } from "../middleware/auth.middleware";
import { WorkerRepository } from "../domain/workers/worker.repository";
import { WarehouseRepository } from "../domain/warehouses/warehouse.repository";
import { CustomerRepository } from "../domain/customers/customer.repository";
import { OrderRepository } from "../domain/orders/order.repository";

const workerRepo = new WorkerRepository();
const warehouseRepo = new WarehouseRepository();
const customerRepo = new CustomerRepository();
const orderRepo = new OrderRepository();

// Seed data for local/offline (no-op in production)
workerRepo.seedIfEmpty();
warehouseRepo.seedIfEmpty();
customerRepo.seedIfEmpty();
orderRepo.seedIfEmpty();

const router = Router();

// Public routes
router.use("/auth", authRouter);
router.use("/scan", scanRouter);

// ---- Protected routes ----
router.use(requireAuth);

router.use("/orders", ordersRouter);
router.use("/tasks", tasksRouter);
router.use("/customers", customersRouter);
router.use("/workers", workersRouter);
router.use("/warehouses", warehousesRouter);
router.use("/assign", assignmentRouter);
router.use("/returns", returnsRouter);
router.use("/analytics", analyticsRouter);

export default router;
