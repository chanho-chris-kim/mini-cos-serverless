import { Router } from "express";
import ordersRouter from "./routes/orders.route";
import tasksRouter from "./routes/tasks.route";
import customersRouter from "./routes/customers.route";
import workersRouter from "./routes/workers.route";
import warehousesRouter from "./routes/warehouses.route";
import assignmentRouter from "./routes/assignment.route";
import scanRouter from "./routes/scan.route";
import returnsRouter from "./routes/returns.route";

const router = Router();

router.use("/orders", ordersRouter);
router.use("/tasks", tasksRouter);
router.use("/customers", customersRouter);
router.use("/workers", workersRouter);
router.use("/warehouses", warehousesRouter);
router.use("/assign", assignmentRouter);
router.use("/scan", scanRouter);
router.use("/returns", returnsRouter);

export default router;