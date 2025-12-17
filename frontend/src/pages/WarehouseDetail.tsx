import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchWarehouseInventory,
  fetchWarehouseWorkers,
  fetchWarehouseMetrics,
  fetchWarehouseBackorders,
  type WarehouseInventoryItem,
  type WarehouseWorkerActivity,
  type WarehouseMetrics,
  type WarehouseBackorderItem,
} from "../api/warehouses";
import { useWarehouseEventsSSE } from "../hooks/useWarehouseEventsSSE";
import StatCard from "../components/StatCard";

const queryDefaults = {
  refetchInterval: 2000,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
  staleTime: 0,
  cacheTime: 0,
};

function formatSeconds(sec: number | null) {
  if (sec == null) return "—";
  if (sec < 60) return `${Math.round(sec)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s}s`;
}

function formatPercent(n: number | null) {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

export default function WarehouseDetail() {
  const { id = "" } = useParams();

  const { data: inventory = [], isLoading: invLoading, error: invError } = useQuery({
    queryKey: ["warehouse", id, "inventory"],
    queryFn: () => fetchWarehouseInventory(id),
    enabled: !!id,
    ...queryDefaults,
  });

  const { data: workers = [], isLoading: workersLoading, error: workersError } = useQuery({
    queryKey: ["warehouse", id, "workers"],
    queryFn: () => fetchWarehouseWorkers(id),
    enabled: !!id,
    ...queryDefaults,
  });

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ["warehouse", id, "metrics"],
    queryFn: () => fetchWarehouseMetrics(id),
    enabled: !!id,
    ...queryDefaults,
  });

  const { data: backorders = [], isLoading: boLoading, error: boError } = useQuery({
    queryKey: ["warehouse", id, "backorders"],
    queryFn: () => fetchWarehouseBackorders(id),
    enabled: !!id,
    ...queryDefaults,
  });
  const events = useWarehouseEventsSSE(id);

  const anyLoading = invLoading || workersLoading || metricsLoading || boLoading;
  const anyError = invError || workersError || metricsError || boError;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Warehouse: {id}</h2>
          <div className="text-sm text-slate-500">
            <Link to="/warehouses" className="hover:underline text-slate-600">
              Back to Warehouses
            </Link>
          </div>
        </div>
      </div>

      {anyLoading && <div>Loading warehouse data…</div>}
      {anyError && <div className="text-red-600 text-sm">Failed to load some data.</div>}

      {/* Inventory Snapshot */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="font-semibold text-sm mb-2">Inventory Snapshot</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">SKU</th>
                <th className="py-2">Current Stock</th>
                <th className="py-2">Reorder Point</th>
                <th className="py-2">Low Stock</th>
              </tr>
            </thead>
            <tbody>
              {inventory
                .slice()
                .sort((a: WarehouseInventoryItem, b: WarehouseInventoryItem) =>
                  a.lowStock === b.lowStock ? a.sku.localeCompare(b.sku) : a.lowStock ? -1 : 1
                )
                .map((item) => (
                  <tr key={item.sku} className="border-t border-slate-100">
                    <td className="py-2">{item.sku}</td>
                    <td className="py-2">{item.currentStock}</td>
                    <td className="py-2">{item.reorderPoint ?? "—"}</td>
                    <td className={`py-2 ${item.lowStock ? "text-red-600" : "text-emerald-600"}`}>
                      {item.lowStock ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-sm text-slate-500">
                    No inventory data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker Activity */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="font-semibold text-sm mb-2">Worker Activity</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Worker</th>
                <th className="py-2">Active Tasks</th>
                <th className="py-2">Capacity</th>
                <th className="py-2">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w: WarehouseWorkerActivity) => (
                <tr key={w.workerId} className="border-t border-slate-100">
                  <td className="py-2">{w.workerId}</td>
                  <td className="py-2">{w.activeTasks}</td>
                  <td className="py-2">{w.capacity}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(100, Math.round((w.utilization || 0) * 100))}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{formatPercent(w.utilization)}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {workers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-sm text-slate-500">
                    No worker activity for this warehouse.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Throughput & SLA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="font-semibold text-sm mb-2">Throughput & SLA (Last 24h / 7d)</div>
        {metrics ? (
          <div className="grid grid-cols-4 gap-3">
            <StatCard title="Orders Processed" value={metrics.ordersProcessedToday} sub="Last 24h" />
            <StatCard title="Tasks Completed" value={metrics.tasksCompletedToday} sub="Last 24h" />
            <StatCard title="Avg Pick" value={formatSeconds(metrics.avgPickTimeSeconds)} sub="seconds" />
            <StatCard title="Avg Pack" value={formatSeconds(metrics.avgPackTimeSeconds)} sub="seconds" />
            <StatCard title="Avg Ship" value={formatSeconds(metrics.avgShipTimeSeconds)} sub="seconds" />
            <StatCard title="Cycle Time" value={formatSeconds(metrics.avgOrderCycleTimeSeconds)} sub="order → ship" />
            <StatCard title="On-time Ship (7d)" value={formatPercent(metrics.sla?.onTimeShipRate7d ?? null)} />
            <StatCard
              title="Avg Delivery Dist (7d)"
              value={
                metrics.sla?.avgDeliveryDistanceKm7d != null
                  ? `${metrics.sla.avgDeliveryDistanceKm7d.toFixed(1)} km`
                  : "—"
              }
            />
          </div>
        ) : (
          <div className="text-sm text-slate-500">No metrics yet.</div>
        )}
      </div>

      {/* Backorders */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="font-semibold text-sm mb-2">Backorders</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Order</th>
                <th className="py-2">Box</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Waiting</th>
                <th className="py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {backorders.map((b: WarehouseBackorderItem) => (
                <tr key={`${b.orderId}-${b.boxId}`} className="border-t border-slate-100">
                  <td className="py-2">{b.orderId}</td>
                  <td className="py-2">{b.boxId}</td>
                  <td className="py-2">{b.sku}</td>
                  <td className="py-2">{Math.round(b.waitingSeconds)}s</td>
                  <td className="py-2 text-red-600">{b.reason}</td>
                </tr>
              ))}
              {backorders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-sm text-slate-500">
                    No active backorders for this warehouse 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Events */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="font-semibold text-sm mb-2">Warehouse Events</div>
        <div className="h-48 overflow-auto space-y-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2">
          {events.length === 0 && (
            <div className="text-slate-500">No events yet.</div>
          )}
          {events
            .slice()
            .sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            .map((e) => (
              <div key={e.id} className="flex items-center gap-2">
                <span className="text-slate-400">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {e.type}
                </span>
                <span className="text-slate-700">{e.message}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
