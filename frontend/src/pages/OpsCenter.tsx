import { useQuery } from "@tanstack/react-query";
import StatCard from "../components/StatCard";
import {
  fetchOpsSummary,
  fetchOpsExceptions,
  fetchBackorderSummary,
  type OpsException,
  type BackorderSummary,
} from "../api/ops";
import { useWarehouseEventsSSE } from "../hooks/useWarehouseEventsSSE";
import type { WarehouseEvent } from "../api/warehouses";
import { useUserStore } from "../lib/store";
import { Navigate } from "react-router-dom";

const mapWarehouses = [
  { id: "WH-MTL-01", name: "Montreal", lat: 45.5, lng: -73.57 },
  { id: "WH-TOR-01", name: "Toronto", lat: 43.65, lng: -79.38 },
  { id: "WH-VAN-01", name: "Vancouver", lat: 49.28, lng: -123.12 },
  { id: "WH-CGY-01", name: "Calgary", lat: 51.04, lng: -114.07 },
];

export default function OpsCenter() {
  const user = useUserStore((s) => s.user);
  if (!user || user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  const events = useWarehouseEventsSSE();

  const { data: summary } = useQuery({
    queryKey: ["ops", "summary"],
    queryFn: fetchOpsSummary,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: exceptions = [] } = useQuery({
    queryKey: ["ops", "exceptions"],
    queryFn: fetchOpsExceptions,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: backorderSummary } = useQuery<BackorderSummary>({
    queryKey: ["ops", "backorders"],
    queryFn: fetchBackorderSummary,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Operations Control Center</h2>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard title="Active Orders" value={summary?.activeOrders ?? "—"} />
        <StatCard title="Active Tasks" value={summary?.activeTasks ?? "—"} />
        <StatCard title="Backorders" value={summary?.backorders ?? "—"} />
        <StatCard
          title="Throughput"
          value={
            summary ? `${summary.throughput.ordersPerMin} ord/min` : "—"
          }
          sub={
            summary
              ? `${summary.throughput.tasksPerMin} tasks/min • ${summary.throughput.scansPerMin} scans/min`
              : ""
          }
        />
      </div>

      {backorderSummary && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="font-semibold text-sm mb-2">Backorders</div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <StatCard title="Open Backorders" value={backorderSummary.totalOpenBackorders} />
            <StatCard title="Backordered Units" value={backorderSummary.totalBackorderedUnits} />
            <StatCard
              title="Oldest Open"
              value={
                backorderSummary.oldestOpenBackorderAgeMinutes != null
                  ? `${Math.round(backorderSummary.oldestOpenBackorderAgeMinutes)} min`
                  : "—"
              }
            />
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-1">Warehouse</th>
                  <th className="py-1">Open</th>
                  <th className="py-1">Units</th>
                  <th className="py-1">Oldest (min)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(backorderSummary.byWarehouse).map(([wh, data]) => (
                  <tr key={wh} className="border-t border-slate-100">
                    <td className="py-1">{wh}</td>
                    <td className="py-1">{data.openCount}</td>
                    <td className="py-1">{data.openUnits}</td>
                    <td className="py-1">
                      {data.oldestOpenAgeMinutes != null
                        ? Math.round(data.oldestOpenAgeMinutes)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* Live Events */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-4">
          <div className="font-semibold text-sm mb-2">Live Events</div>
          <div className="h-64 overflow-auto space-y-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2">
            {events.length === 0 && <div className="text-slate-500">No events yet.</div>}
            {events.map((e: WarehouseEvent) => (
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

        {/* Map (simple markers list) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="font-semibold text-sm mb-2">Warehouse Map</div>
          <div className="text-xs text-slate-600 space-y-1">
            {mapWarehouses.map((w) => (
              <div key={w.id} className="flex items-center gap-2">
                <span className="font-semibold">{w.name}</span>
                <span className="text-slate-500">
                  {w.lat.toFixed(2)}, {w.lng.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouse health */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="font-semibold text-sm mb-2">Warehouse Health</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Warehouse</th>
                <th className="py-2">Active Tasks</th>
                <th className="py-2">Capacity</th>
                <th className="py-2">Utilization</th>
                <th className="py-2">Backorders</th>
                <th className="py-2">Low Inventory</th>
              </tr>
            </thead>
            <tbody>
              {summary?.warehouses.map((w) => (
                <tr key={w.id} className="border-t border-slate-100">
                  <td className="py-2">{w.name}</td>
                  <td className="py-2">{w.activeTasks}</td>
                  <td className="py-2">{w.capacity}</td>
                  <td className="py-2">{Math.round((w.utilization ?? 0) * 100)}%</td>
                  <td className="py-2">{w.backorders}</td>
                  <td className={`py-2 ${w.lowInventory ? "text-red-600" : "text-emerald-600"}`}>
                    {w.lowInventory ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
              {!summary && (
                <tr>
                  <td colSpan={6} className="py-3 text-sm text-slate-500">
                    Loading warehouse health...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exceptions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="font-semibold text-sm mb-2">Exception Feed</div>
        <div className="h-48 overflow-auto space-y-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2">
          {exceptions.length === 0 && <div className="text-slate-500">No exceptions.</div>}
          {exceptions.map((e: OpsException) => (
            <div key={e.id} className="flex items-center gap-2">
              <span className="text-slate-400">
                {new Date(e.timestamp).toLocaleTimeString()}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">
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
