// backend/src/domain/orders/order.service.ts
import { orderRepo, taskRepo } from "../sharedRepos";
import type { BoxEntity } from "./box.model";
import type { ReturnCategory } from "./box.model";
import { AssignmentService } from "../ai/assignment.service";
import { ALL_SKUS } from "../../utils/skuList";
import { eventLogger } from "../events/eventLogger.service";

export class OrderService {
  private assignment = new AssignmentService();

  async listOrders() {
    const orders = orderRepo.listOrders();
    const tasks = await taskRepo.listTasks();
    const enriched = orders.map((o) => ({
      ...o,
      tasks: tasks.filter((t) => t.orderId === o.id),
    }));
    return enriched;
  }

  async getOrder(id: string) {
    const order = await orderRepo.findById(id);
    if (!order) throw new Error("Order not found");
    const tasks = await taskRepo.listTasks();
    return { ...order, tasks: tasks.filter((t) => t.orderId === id) };
  }

  async createOrder(data: any) {
    // Create a basic order record
    const orderId = data.id ?? `ORD-${Date.now()}`;
    const destination =
      data.destination ??
      data.destinationAddress ?? {
        line1: "200 Boulevard René-Lévesque Ouest",
        city: "Montreal",
        province: "QC",
        postal: "H2Z 1X4",
        lat: 45.503,
        lng: -73.572,
        address: "200 Boulevard René-Lévesque Ouest",
      };

    // Build boxes from incoming boxes or items (one box per item entry/qty)
    let boxes: BoxEntity[] = [];
    if (Array.isArray(data.boxes) && data.boxes.length > 0) {
      boxes = data.boxes.map((b: any, idx: number) => ({
        id: b.id ?? `${orderId}-BOX-${idx + 1}`,
        orderId,
        sku: b.sku ?? "UNKNOWN",
        state: b.state ?? "PENDING",
        warehouseId: b.warehouseId,
      }));
      const invalid = boxes.find((b) => b.sku && !ALL_SKUS.includes(b.sku));
      if (invalid) throw new Error(`Unknown SKU: ${invalid.sku}`);
    } else if (Array.isArray(data.items) && data.items.length > 0) {
      data.items.forEach((item: any, idx: number) => {
        const qty = item.qty ?? 1;
        if (!ALL_SKUS.includes(item.sku)) {
          throw new Error(`Unknown SKU: ${item.sku}`);
        }
        for (let i = 0; i < qty; i++) {
          boxes.push({
            id: `${orderId}-BOX-${idx + 1}-${i + 1}`,
            orderId,
            sku: item.sku ?? "UNKNOWN",
            state: "PENDING",
          } as BoxEntity);
        }
      });
    } else {
      boxes.push({
        id: `${orderId}-BOX-1`,
        orderId,
        sku: "UNKNOWN",
        state: "PENDING",
      } as BoxEntity);
    }

    // Choose warehouse
    const warehouse = await this.assignment.assignWarehouse({
      lat: destination.lat,
      lng: destination.lng,
      skuList: boxes.map((b) => b.sku),
    });
    if (!warehouse) throw new Error("No available warehouse");

    // Assign warehouse to boxes and build routes
    boxes = boxes.map((b) => ({ ...b, warehouseId: warehouse.id }));
    const routes: Record<string, string[]> = {
      [warehouse.id]: boxes.map((b) => b.id),
    };

    const order = {
      id: orderId,
      customerId: data.customerId ?? `C-${Date.now()}`,
      customerName: data.customerName ?? "Simulator Customer",
      createdAt: new Date().toISOString(),
      destination: {
        line1: destination.line1 ?? destination.street ?? destination.address ?? "Unknown",
        city: destination.city ?? "Unknown",
        province: destination.province,
        postal: destination.postal ?? "Unknown",
        lat: destination.lat,
        lng: destination.lng,
        street: destination.street ?? destination.line1,
        address: destination.address ?? destination.line1 ?? destination.street ?? "Unknown",
      },
      status: "PENDING",
      routes,
      boxes,
    };

    orderRepo.saveOrder(order as any);
    eventLogger.log(
      warehouse.id,
      "ORDER_CREATED",
      `Order ${order.id} created for customer ${order.customerName}`,
      { orderId: order.id, customerId: order.customerId }
    );

    const tasks = await this.assignment.generateTasksForWarehouse(
      orderId,
      warehouse.id,
      boxes
    );
    await this.assignment.autoAssignTasks();

    // Save any box state updates and routes
    orderRepo.saveOrder(order as any);

    return { order, tasks, warehouse };
  }

  async updateStatusDerived(orderId: string) {
    return orderRepo.recomputeOrderStatus(orderId);
  }

  async getReturnCandidates(): Promise<BoxEntity[]> {
    const boxes = await orderRepo.listBoxes();
    return boxes.filter((b) =>
      ["QA_PENDING", "QA_IN_PROGRESS", "QA_DONE"].includes(b.state)
    );
  }

  async processReturnCheckIn(params: {
    boxId: string;
    warehouseId: string;
    userId: string;
  }) {
    const { boxId, warehouseId } = params;
    const box = await orderRepo.updateBoxState(boxId, "QA_PENDING");
    if (!box) throw new Error("Box not found for return check-in");

    if (!box.warehouseId) {
      box.warehouseId = warehouseId;
      const order = await orderRepo.findOrderByBoxId(boxId);
      if (order) await orderRepo.updateOrder(order);
    }

    await orderRepo.recomputeOrderStatus(box.orderId);
    return { ...box, message: "Return received + QA pending" };
  }

  async classifyReturn(params: {
    boxId: string;
    category: ReturnCategory;
    notes?: string;
  }) {
    const box = await orderRepo.classifyReturn(
      params.boxId,
      params.category,
      params.notes
    );
    if (!box) throw new Error("Box not found");
    await orderRepo.recomputeOrderStatus(box.orderId);
    return box;
  }
}
