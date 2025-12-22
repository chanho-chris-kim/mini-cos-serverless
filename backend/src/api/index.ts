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
import simulatorRouter from "./routes/simulator.route";
import integrationsRouter from "./routes/integrations.route";
import metadataRouter from "./routes/metadata.route";
import analyticsLowStockRouter from "./routes/analyticsLowStock.route";
import skuRouter from "./routes/skus.route";
import warehouseMetricsRouter from "./routes/warehouseMetrics.route";
import warehouseEventsRouter from "./routes/warehouseEvents.route";
import warehouseEventsStreamRouter from "./routes/warehouseEvents.stream.route";
import opsRouter from "./routes/ops.route";
import { devBypassAuth } from "../middleware/devBypass.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { workerRepo, warehouseRepo, orderRepo, customerRepo } from "../domain/sharedRepos";

workerRepo.seedIfEmpty();
warehouseRepo.seedIfEmpty();
customerRepo.seedIfEmpty?.();
orderRepo.seedIfEmpty?.();

const router = Router();

// 🚀 Dev bypass inside API router (works in serverless offline)
router.use(devBypassAuth); 

// 🔓 Public routes
router.use("/metadata", metadataRouter);
router.use("/skus", skuRouter);
router.use("/auth", authRouter);
router.use("/scan", scanRouter);
router.use("/integrations", integrationsRouter);
router.use("/simulator", simulatorRouter);

// 🔒 Everything below requires JWT auth
router.use(requireAuth);

router.use("/orders", ordersRouter);
router.use("/tasks", tasksRouter);
router.use("/customers", customersRouter);
router.use("/workers", workersRouter);
// Place stream routes early to avoid other routers shadowing them
router.use("/warehouses", warehouseEventsStreamRouter);
router.use("/warehouses", warehousesRouter);
router.use("/warehouses", warehouseMetricsRouter);
router.use("/warehouses", warehouseEventsRouter);
router.use("/ops", opsRouter);
router.use("/assign", assignmentRouter);
router.use("/returns", returnsRouter);
router.use("/analytics", analyticsRouter);
router.use("/analytics/low-stock", analyticsLowStockRouter);

export default router;
