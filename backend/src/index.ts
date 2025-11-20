import express from "express";
import cors from "cors";
import {
  createOrder,
  fetchOrders,
  deleteOrder
} from "./handlers/orders.handler";
import {
  fetchTasks,
  assignTasksEndpoint,
  updateTaskStatusEndpoint,
  deleteTaskEndpoint
} from "./handlers/tasks.handler";

const app = express();
app.use(cors());
app.use(express.json());

// Orders endpoints
app.post("/orders", createOrder);
app.get("/orders", fetchOrders);
app.delete("/orders/:id", deleteOrder);

// Tasks endpoints
app.get("/tasks", fetchTasks);
app.post("/tasks/assign", assignTasksEndpoint);
app.delete("/tasks/:id", deleteTaskEndpoint);

// New: update task status
app.patch("/tasks/:id", updateTaskStatusEndpoint);

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
