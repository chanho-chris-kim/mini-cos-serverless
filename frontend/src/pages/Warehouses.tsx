import { useQuery } from "@tanstack/react-query";
import StatCard from "../components/StatCard";
import * as WarehousesAPI from "../api/warehouses";
import { useNavigate } from "react-router-dom";
import { useWarehouseEventsSSE } from "../hooks/useWarehouseEventsSSE";

export default function Warehouses() {
  const navigate = useNavigate();
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: WarehousesAPI.fetchWarehouses,
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    staleTime: 0,
    cacheTime: 0,
  });

  const events = useWarehouseEventsSSE();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Warehouses</h2>

      <div className="grid grid-cols-3 gap-3">
        {warehouses.map((w: WarehousesAPI.ApiWarehouse) => (
          <button
            key={w.id}
            onClick={() => navigate(`/warehouses/${w.id}`)}
            className="text-left"
          >
            <StatCard
              title={w.name}
              value={`${w.location.city}, ${w.location.province}`}
              sub={`${w.location.street}, ${w.location.postal}`}
            />
          </button>
        ))}
        {warehouses.length === 0 && (
          <div className="text-sm text-slate-500">
            No warehouses found. Check backend connection.
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="font-semibold text-sm mb-2">Warehouse Feed</div>
        <div className="h-40 overflow-auto space-y-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2">
          {events.length === 0 && (
            <div className="text-slate-500">No events yet.</div>
          )}
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-2">
              <span className="text-slate-400">
                {new Date(e.timestamp).toLocaleString()}
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
