import { useQuery } from "@tanstack/react-query";
import StatCard from "../components/StatCard";
import * as OrdersAPI from "../api/orders";
import * as TasksAPI from "../api/tasks";
import * as AnalyticsAPI from "../api/analytics";
import LowStockBanner from "../components/LowStockBanner";
import type { User } from "../lib/types";
import { isOrderFulfilled } from "../utils/orderStatus";

export default function Dashboard({ user }: { user: User | null }) {
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: OrdersAPI.fetchOrders,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: TasksAPI.fetchTasks,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });
  const { data: lowStock = [] } = useQuery({
    queryKey: ["analytics", "low-stock"],
    queryFn: AnalyticsAPI.getLowStock,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });

  console.log("[DASHBOARD] orders:", orders);
  console.log("[DASHBOARD] tasks:", tasks.length);

  const fulfilledOrders = orders.filter(isOrderFulfilled).length;
  const pendingOrders = orders.filter((o) => !isOrderFulfilled(o)).length;
  const partialOrders = orders.filter((o) => o.status === "PARTIAL").length;
  const openTasks = tasks.filter((t) => t.status !== "DONE").length;

  return (
    <div className="space-y-4">
      <LowStockBanner />

      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <div className="text-sm text-slate-500">Overview for {user?.role}</div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard title="Pending Orders" value={pendingOrders} />
        <StatCard title="Partial Fulfillments" value={partialOrders} />
        <StatCard title="Open Tasks" value={openTasks} />
        <StatCard title="Split Shipments (today)" value={"—"} sub="coming soon" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="font-semibold text-sm mb-2">Alerts</div>
          {lowStock.length === 0 ? (
            <div className="text-sm text-slate-600">No low-stock alerts.</div>
          ) : (
            <ul className="text-sm text-slate-600 list-disc ml-5 space-y-1">
              {lowStock.map((item: any) => (
                <li key={`${item.warehouseId}-${item.sku}`}>
                  {item.warehouseId}: {item.sku} → {item.quantity}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="font-semibold text-sm mb-2">Ops Notes</div>
          <p className="text-sm text-slate-600">
            Auto-routing and advanced ops automation will be wired to COS events.
          </p>
        </div>
      </div>
    </div>
  );
}
