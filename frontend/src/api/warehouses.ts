import { api } from "./apiClient";
import type { Warehouse } from "../lib/types";

export type ApiWarehouse = {
  id: string;
  name: string;
  location: {
    street: string;
    city: string;
    province: string;
    postal: string;
    lat: number;
    lng: number;
  };
};

export async function fetchWarehouses(): Promise<ApiWarehouse[]> {
  const res = await api.get("/warehouses");
  return res.data;
}

export type WarehouseInventoryItem = {
  sku: string;
  warehouseId: string;
  currentStock: number;
  reorderPoint?: number;
  capacity?: number;
  lowStock: boolean;
};

export type WarehouseWorkerActivity = {
  workerId: string;
  warehouseId: string;
  activeTasks: number;
  completedTasksToday: number;
  capacity: number;
  utilization: number;
};

export type WarehouseMetrics = {
  warehouseId: string;
  timeRange: { from: string; to: string };
  ordersProcessedToday: number;
  tasksCompletedToday: number;
  avgPickTimeSeconds: number | null;
  avgPackTimeSeconds: number | null;
  avgShipTimeSeconds: number | null;
  avgOrderCycleTimeSeconds: number | null;
  sla: {
    onTimeShipRate7d: number | null;
    avgDeliveryDistanceKm7d: number | null;
  };
};

export type WarehouseBackorderItem = {
  warehouseId: string;
  orderId: string;
  boxId: string;
  sku: string;
  requestedQty: number;
  createdAt: string;
  waitingSeconds: number;
  reason: "INSUFFICIENT_STOCK";
};

export type WarehouseEvent = {
  id: string;
  warehouseId: string;
  type: string;
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
};

export async function fetchWarehouseInventory(id: string): Promise<WarehouseInventoryItem[]> {
  const res = await api.get(`/warehouses/${id}/inventory`);
  return res.data.inventory ?? res.data ?? [];
}

export async function fetchWarehouseWorkers(id: string): Promise<WarehouseWorkerActivity[]> {
  const res = await api.get(`/warehouses/${id}/workers`);
  return res.data.workers ?? res.data ?? [];
}

export async function fetchWarehouseMetrics(id: string): Promise<WarehouseMetrics> {
  const res = await api.get(`/warehouses/${id}/metrics`);
  return res.data;
}

export async function fetchWarehouseBackorders(id: string): Promise<WarehouseBackorderItem[]> {
  const res = await api.get(`/warehouses/${id}/backorders`);
  return res.data.backorders ?? res.data ?? [];
}

export async function fetchWarehouseEvents(id: string, limit = 50): Promise<WarehouseEvent[]> {
  const res = await api.get(`/warehouses/${id}/events`, { params: { limit } });
  return res.data.events ?? res.data ?? [];
}
