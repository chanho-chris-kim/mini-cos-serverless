import { useQuery } from "@tanstack/react-query";
import StatCard from "../components/StatCard";
import * as WarehousesAPI from "../api/warehouses";

export default function Warehouses() {
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: WarehousesAPI.fetchWarehouses,
  });

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Warehouses</h2>

      <div className="grid grid-cols-3 gap-3">
        {warehouses.map((w) => (
          <StatCard key={w.id} title={w.name} value={w.region || "—"} sub={`ID: ${w.id}`} />
        ))}
        {warehouses.length === 0 && (
          <>
            <StatCard title="W-MTL" value="Montreal" />
            <StatCard title="W-VAN" value="Vancouver" />
            <StatCard title="W-TOR" value="Toronto" />
          </>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="font-semibold text-sm mb-2">Warehouse Feed</div>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>Live warehouse events will stream here.</li>
        </ul>
      </div>
    </div>
  );
}
