import { api } from "./apiClient";

export type OpsSummary = {
  activeOrders: number;
  activeTasks: number;
  ordersByStatus: Record<string, number>;
  tasksByStatus: Record<string, number>;
  backorders: number;
  warehouses: Array<{
    id: string;
    name: string;
    activeTasks: number;
    capacity: number;
    utilization: number;
    backorders: number;
    lowInventory: boolean;
  }>;
  throughput: {
    ordersPerMin: number;
    tasksPerMin: number;
    scansPerMin: number;
  };
};

export type OpsException = {
  id: string;
  warehouseId: string;
  type: string;
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
};

export async function fetchOpsSummary(): Promise<OpsSummary> {
  const res = await api.get("/ops/summary");
  return res.data;
}

export async function fetchOpsExceptions(): Promise<OpsException[]> {
  const res = await api.get("/ops/exceptions");
  return res.data.exceptions ?? res.data ?? [];
}

export type BackorderSummary = {
  totalOpenBackorders: number;
  totalBackorderedUnits: number;
  oldestOpenBackorderAgeMinutes: number | null;
  byWarehouse: Record<
    string,
    { openCount: number; openUnits: number; oldestOpenAgeMinutes: number | null }
  >;
};

export type WarehouseOpsSnapshot = {
  warehouseId: string;
  warehouseName?: string;
  activeTasks: number;
  capacity: number;
  utilization: number;
  openBackorders: number;
  openBackorderedUnits: number;
  oldestBackorderAgeMinutes: number | null;
};

export async function fetchBackorderSummary(): Promise<BackorderSummary> {
  const res = await api.get("/ops/backorders/summary");
  return res.data.summary ?? res.data;
}

export async function fetchWarehouseOpsSnapshot(
  warehouseId: string
): Promise<WarehouseOpsSnapshot> {
  const res = await api.get(`/ops/warehouse/${warehouseId}`);
  return res.data;
}
