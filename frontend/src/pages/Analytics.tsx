import { useQuery } from "@tanstack/react-query";
import StatCard from "../components/StatCard";
import {
  fetchOverview,
  fetchSlaMetrics,
  fetchReturnMetrics,
} from "../api/analytics";

function formatPercent(n: number) {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "0%";
  return `${Math.round(n * 100)}%`;
}

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchOverview,
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    staleTime: 0,
    cacheTime: 0,
  });
  const { data: sla } = useQuery({
    queryKey: ["analytics", "sla"],
    queryFn: fetchSlaMetrics,
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    staleTime: 0,
    cacheTime: 0,
  });
  const { data: returns } = useQuery({
    queryKey: ["analytics", "returns"],
    queryFn: fetchReturnMetrics,
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    staleTime: 0,
    cacheTime: 0,
  });

  if (isLoading) return <div>Loading analytics...</div>;
  const orders = data?.orders ?? { total: 0, byStatus: {} };
  const tasks = data?.tasks ?? { total: 0, byStatus: {}, byType: {} };
  const warehouseLoad = data?.warehouses?.load ?? [];
  const lowStock = data?.warehouses?.lowStock ?? [];
  const workerUtil = data?.workers?.utilization ?? [];

  const avgWorkerUtil =
    workerUtil.length === 0
      ? 0
      : workerUtil.reduce((sum: number, w: any) => sum + (w.utilization || 0), 0) /
        workerUtil.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Analytics Overview</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          title="Orders"
          value={orders.total}
          sub={`PENDING: ${orders.byStatus?.PENDING ?? 0} • PARTIAL: ${orders.byStatus?.PARTIAL ?? 0} • FULFILLED: ${
            orders.byStatus?.FULFILLED ?? 0
          } • DELIVERED: ${orders.byStatus?.DELIVERED ?? 0} • RETURNED: ${orders.byStatus?.RETURNED ?? 0}`}
        />
        <StatCard
          title="Tasks"
          value={tasks.total}
          sub={`PENDING: ${tasks.byStatus?.PENDING ?? 0} • IN_PROGRESS: ${tasks.byStatus?.IN_PROGRESS ?? 0} • DONE: ${
            tasks.byStatus?.DONE ?? 0
          }`}
        />
        <StatCard
          title="Avg Worker Utilization"
          value={formatPercent(avgWorkerUtil)}
          sub={`${workerUtil.length} workers`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="font-semibold text-sm mb-2">Warehouse Load</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Warehouse</th>
                <th>Active</th>
                <th>Capacity</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {warehouseLoad.map((w: any) => (
                <tr key={w.id} className="border-t border-slate-100">
                  <td className="py-2">{w.name}</td>
                  <td>{w.activeTasks}</td>
                  <td>{w.capacity}</td>
                  <td>{formatPercent(w.utilization)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="font-semibold text-sm mb-2">Low Stock</div>
          {lowStock.length === 0 ? (
            <div className="text-sm text-slate-500">No low-stock SKUs.</div>
          ) : (
            <ul className="text-sm text-slate-700 space-y-1">
              {lowStock.map((item: any, idx: number) => (
                <li key={`${item.warehouseId}-${item.sku}-${idx}`}>
                  {item.warehouseId} — {item.sku} ({item.quantity})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="font-semibold text-sm mb-2">Worker Utilization</div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Worker</th>
              <th>Warehouse</th>
              <th>Load</th>
              <th>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {workerUtil.map((w: any) => (
              <tr key={w.id} className="border-t border-slate-100">
                <td className="py-2">{w.name}</td>
                <td>{w.warehouseId}</td>
                <td>
                  {w.currentTasks} / {w.maxTasks}
                </td>
                <td>{formatPercent(w.utilization)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SLA Metrics */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="font-semibold text-sm mb-2">SLA Metrics</div>
        <div className="grid grid-cols-4 gap-3">
          <StatCard title="Avg Time to Pick (min)" value={sla?.avgTimeToPickMinutes ?? "—"} />
          <StatCard title="Avg Time to Pack (min)" value={sla?.avgTimeToPackMinutes ?? "—"} />
          <StatCard title="Avg Time to Ship (min)" value={sla?.avgTimeToShipMinutes ?? "—"} />
          <StatCard title="On-Time Ship Rate" value={sla?.onTimeShipRate != null ? formatPercent(sla.onTimeShipRate) : "—"} />
        </div>
      </div>

      {/* Return Metrics */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="font-semibold text-sm mb-2">Return Metrics</div>
        <StatCard
          title="Global Return Rate"
          value={returns?.globalReturnRate != null ? formatPercent(returns.globalReturnRate) : "—"}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-semibold text-xs text-slate-600 mb-1">By SKU</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-1">SKU</th>
                  <th className="py-1">Shipped</th>
                  <th className="py-1">Returned</th>
                  <th className="py-1">Rate</th>
                </tr>
              </thead>
              <tbody>
                {(returns?.bySku ?? []).map((r: any) => (
                  <tr key={r.sku} className="border-t border-slate-100">
                    <td className="py-1">{r.sku}</td>
                    <td className="py-1">{r.shippedBoxes}</td>
                    <td className="py-1">{r.returnedBoxes}</td>
                    <td className="py-1">{formatPercent(r.rate ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-600 mb-1">By Warehouse</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-1">Warehouse</th>
                  <th className="py-1">Shipped</th>
                  <th className="py-1">Returned</th>
                  <th className="py-1">Rate</th>
                </tr>
              </thead>
              <tbody>
                {(returns?.byWarehouse ?? []).map((r: any) => (
                  <tr key={r.warehouseId} className="border-t border-slate-100">
                    <td className="py-1">{r.warehouseId}</td>
                    <td className="py-1">{r.shippedBoxes}</td>
                    <td className="py-1">{r.returnedBoxes}</td>
                    <td className="py-1">{formatPercent(r.rate ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
