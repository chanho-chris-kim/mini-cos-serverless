// backend/src/domain/simulator/simulator.service.ts
import { OrderService } from "../orders/order.service";
import { TaskService } from "../tasks/task.service";
import { ReturnsService } from "../returns/returns.service";
import { warehouseRepo, workerRepo } from "../sharedRepos";
import { randomSKU, randomAddress, chance, pickOne } from "./random";

export class SimulatorService {
  private orderService = new OrderService();
  private taskService = new TaskService();
  private returnsService = new ReturnsService();
  private warehouseRepo = warehouseRepo;
  private workerRepo = workerRepo;

  // Called by /simulator/tick
  async runOneTick() {
    const events: string[] = [];

    // 20% chance → new order
    if (chance(0.2)) {
      const order = await this.generateOrder();
      events.push(`New order created: ${order.id}`);
    }

    // 30% chance → worker scans progress
    if (chance(0.3)) {
      const scanMsg = await this.simulateWorkerScan();
      if (scanMsg) events.push(scanMsg);
    }

    // 10% chance → a delivered order triggers return
    if (chance(0.1)) {
      const retMsg = await this.simulateReturn();
      if (retMsg) events.push(retMsg);
    }

    return { events, timestamp: new Date().toISOString() };
  }

  // --------------------------
  //  ORDER GENERATION
  // --------------------------
  async generateOrder() {
    const warehouses = await this.warehouseRepo.listWarehouses();
    const workers = await this.workerRepo.listWorkers();

    const wh = pickOne(warehouses);
    const worker = pickOne(workers);

    const sku = randomSKU();
    const destination = randomAddress();

    const order = await this.orderService.createOrder({
      customerId: "sim-customer",
      customerName: "Simulator Customer",
      items: [{ sku, qty: 1 }],
      destinationAddress: destination,
      warehouseId: wh.id,
    });

    return order;
  }

  // --------------------------
  //  WORKER SCAN SIMULATION
  // --------------------------
  async simulateWorkerScan() {
    const allTasks = await this.taskService.listTasks();
    const pending = allTasks.filter((t) => t.status !== "DONE");

    if (pending.length === 0) return null;

    const task = pickOne(pending);

    const nextStates = ["IN_PROGRESS", "DONE"];
    const newState = pickOne(nextStates) as any;

    await this.taskService.updateStatus(task.id, newState);

    return `Worker scanned task ${task.id} → ${newState}`;
  }

  // --------------------------
  //  RETURNS SIMULATION
  // --------------------------
  async simulateReturn() {
    const orders = await this.orderService.listOrders();
    const delivered = orders.filter((o) => o.status === "DELIVERED");

    if (delivered.length === 0) return null;

    const order = pickOne(delivered);

    const box = order.boxes[0];
    if (!box) return null;

    await this.returnsService.intakeReturn(box.id, order.warehouseId as string);
    await this.returnsService.startQA(box.id);

    const result = await this.returnsService.classify(
      box.id,
      pickOne(["FULL_PRICE", "DISCOUNT", "SCRAP"]),
      "Simulated return"
    );

    return `Return processed for ${order.id} (${box.id}) → ${result.category}`;
  }
}
