import { orderRepo, taskRepo, warehouseRepo } from "../sharedRepos";
import type {
  WarehouseMetrics,
  SlaMetrics,
  ReturnMetrics,
  ReturnRateBySku,
  ReturnRateByWarehouse,
} from "../../types";
import { haversineDistanceKm } from "../ai/distance";

export class MetricsService {
  // Computes metrics over a sliding window; today = last 24h.
  async getWarehouseMetrics(warehouseId: string, now: Date = new Date()): Promise<WarehouseMetrics> {
    const to = now.getTime();
    const from = to - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = to - 7 * 24 * 60 * 60 * 1000;

    const tasks = await taskRepo.listTasks();
    const orders = orderRepo.listOrders();

    const tasksForWh = tasks.filter((t) => t.warehouseId === warehouseId);
    const tasks24h = tasksForWh.filter((t) => new Date(t.createdAt).getTime() >= from && t.status === "DONE");

    const tasksCompletedToday = tasks24h.length;
    const ordersProcessedToday = orders.filter(
      (o) =>
        new Date(o.createdAt).getTime() >= from &&
        (o.routes?.[warehouseId]?.length || o.boxes.some((b) => b.warehouseId === warehouseId))
    ).length;

    // Duration calculations: using createdAt as proxy for completion time (no explicit completedAt).
    const avgDuration = (type: string) => {
      const filtered = tasks24h.filter((t) => t.type === type);
      if (filtered.length === 0) return null;
      // Without assigned/complete timestamps, return null; placeholder for future telemetry.
      return null;
    };

    // Cycle time: order createdAt -> last SHIP task DONE for that order
    let cycleSum = 0;
    let cycleCount = 0;
    for (const order of orders) {
      const shipTasks = tasksForWh.filter((t) => t.orderId === order.id && t.type === "SHIP" && t.status === "DONE");
      if (shipTasks.length === 0) continue;
      const lastShip = Math.max(...shipTasks.map((t) => new Date(t.createdAt).getTime()));
      const createdAt = new Date(order.createdAt).getTime();
      if (lastShip >= from) {
        cycleSum += (lastShip - createdAt) / 1000;
        cycleCount += 1;
      }
    }
    const avgOrderCycleTimeSeconds = cycleCount === 0 ? null : cycleSum / cycleCount;

    // SLA: on-time ship rate over last 7 days (completed within 48h)
    const recentOrders = orders.filter(
      (o) =>
        new Date(o.createdAt).getTime() >= sevenDaysAgo &&
        (o.routes?.[warehouseId]?.length || o.boxes.some((b) => b.warehouseId === warehouseId))
    );
    let slaTotal = 0;
    let slaOnTime = 0;
    let distanceSum = 0;
    let distanceCount = 0;
    const wh = warehouseRepo.findById(warehouseId);
    for (const order of recentOrders) {
      const shipTasks = tasksForWh.filter((t) => t.orderId === order.id && t.type === "SHIP" && t.status === "DONE");
      if (shipTasks.length === 0) continue;
      slaTotal += 1;
      const lastShip = Math.max(...shipTasks.map((t) => new Date(t.createdAt).getTime()));
      const createdAt = new Date(order.createdAt).getTime();
      if (lastShip - createdAt <= 48 * 60 * 60 * 1000) {
        slaOnTime += 1;
      }
      if (order.destination && wh) {
        distanceSum += haversineDistanceKm(
          order.destination.lat,
          order.destination.lng,
          wh.location.lat,
          wh.location.lng
        );
        distanceCount += 1;
      }
    }

    return {
      warehouseId,
      timeRange: { from: new Date(from).toISOString(), to: new Date(to).toISOString() },
      ordersProcessedToday,
      tasksCompletedToday,
      avgPickTimeSeconds: avgDuration("PICK"),
      avgPackTimeSeconds: avgDuration("PACK"),
      avgShipTimeSeconds: avgDuration("SHIP"),
      avgOrderCycleTimeSeconds,
      sla: {
        onTimeShipRate7d: slaTotal === 0 ? null : slaOnTime / slaTotal,
        avgDeliveryDistanceKm7d: distanceCount === 0 ? null : distanceSum / distanceCount,
      },
    };
  }

  async getSlaMetrics(): Promise<SlaMetrics> {
    const orders = orderRepo.listOrders();
    const tasks = await taskRepo.listTasks();

    const toMinutes = (ms: number) => ms / (60 * 1000);
    const pickDiffs: number[] = [];
    const packDiffs: number[] = [];
    const shipDiffs: number[] = [];

    for (const o of orders) {
      const created = new Date(o.createdAt).getTime();
      const pick = tasks
        .filter((t) => t.orderId === o.id && t.type === "PICK")
        .sort((a, b) => (a.createdAt && b.createdAt ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : 0))[0];
      const pack = tasks
        .filter((t) => t.orderId === o.id && t.type === "PACK")
        .sort((a, b) => (a.createdAt && b.createdAt ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : 0))[0];
      const ship = tasks
        .filter((t) => t.orderId === o.id && t.type === "SHIP")
        .sort((a, b) => (a.createdAt && b.createdAt ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : 0))[0];

      if (pick?.createdAt) pickDiffs.push(toMinutes(new Date(pick.createdAt).getTime() - created));
      if (pack?.createdAt) packDiffs.push(toMinutes(new Date(pack.createdAt).getTime() - created));
      if (ship?.createdAt) shipDiffs.push(toMinutes(new Date(ship.createdAt).getTime() - created));
    }

    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
    const p90 = (arr: number[]) => {
      if (!arr.length) return null;
      const sorted = [...arr].sort((a, b) => a - b);
      const idx = Math.floor(0.9 * (sorted.length - 1));
      return sorted[idx];
    };

    const onTimeShipRate = (() => {
      const targetMinutes = 1440; // 24h
      const eligible = shipDiffs.filter((x) => x != null);
      if (!eligible.length) return null;
      const onTime = eligible.filter((x) => x <= targetMinutes).length;
      return onTime / eligible.length;
    })();

    return {
      avgTimeToPickMinutes: avg(pickDiffs),
      avgTimeToPackMinutes: avg(packDiffs),
      avgTimeToShipMinutes: avg(shipDiffs),
      onTimeShipRate,
      p90TimeToShipMinutes: p90(shipDiffs),
    };
  }

  async getReturnMetrics(): Promise<ReturnMetrics> {
    const orders = orderRepo.listOrders();
    const tasks = await taskRepo.listTasks();

    const shippedBoxesPerOrder: Record<string, number> = {};
    for (const t of tasks) {
      if (t.type === "SHIP" && t.status === "DONE") {
        shippedBoxesPerOrder[t.orderId] = (shippedBoxesPerOrder[t.orderId] ?? 0) + 1;
      }
    }

    let totalShipped = 0;
    let totalReturned = 0;
    const bySkuMap: Record<string, { shipped: number; returned: number }> = {};
    const byWhMap: Record<string, { shipped: number; returned: number }> = {};

    for (const o of orders) {
      const shippedForOrder = shippedBoxesPerOrder[o.id] ?? 0;
      totalShipped += shippedForOrder;
      for (const b of o.boxes) {
        if (["RETURN_RECEIVED", "QA_PENDING", "QA_IN_PROGRESS", "QA_DONE", "RETURN_CLASSIFIED"].includes(b.state)) {
          totalReturned += 1;
          bySkuMap[b.sku] = bySkuMap[b.sku] || { shipped: 0, returned: 0 };
          bySkuMap[b.sku].returned += 1;
          const wh = b.warehouseId ?? "UNKNOWN";
          byWhMap[wh] = byWhMap[wh] || { shipped: 0, returned: 0 };
          byWhMap[wh].returned += 1;
        }
        // shipped counts
        bySkuMap[b.sku] = bySkuMap[b.sku] || { shipped: 0, returned: 0 };
        if (b.state === "DELIVERED" || b.state === "OUTBOUND" || b.state === "SHIPPED") {
          bySkuMap[b.sku].shipped += 1;
          const wh = b.warehouseId ?? "UNKNOWN";
          byWhMap[wh] = byWhMap[wh] || { shipped: 0, returned: 0 };
          byWhMap[wh].shipped += 1;
        }
      }
    }

    const bySku: ReturnRateBySku[] = Object.entries(bySkuMap).map(([sku, data]) => ({
      sku,
      shippedBoxes: data.shipped,
      returnedBoxes: data.returned,
      rate: data.shipped === 0 ? 0 : data.returned / data.shipped,
    }));

    const byWarehouse: ReturnRateByWarehouse[] = Object.entries(byWhMap).map(([warehouseId, data]) => ({
      warehouseId,
      shippedBoxes: data.shipped,
      returnedBoxes: data.returned,
      rate: data.shipped === 0 ? 0 : data.returned / data.shipped,
    }));

    return {
      globalReturnRate: totalShipped === 0 ? null : totalReturned / totalShipped,
      bySku,
      byWarehouse,
    };
  }
}
