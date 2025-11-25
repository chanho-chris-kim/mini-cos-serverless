import { useQuery } from "@tanstack/react-query";
import StatCard from "../components/StatCard";
import * as OrdersAPI from "../api/orders";
import * as TasksAPI from "../api/tasks";
import type { User } from "../lib/types";

export default function Dashboard({ user }: { user: User | null }) {
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: OrdersAPI.fetchOrders });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: TasksAPI.fetchTasks });

  const pendingOrders = orders.filter(o => o.status === "PENDING").length;
  const partialOrders = orders.filter(o => o.status === "PARTIAL").length;
  const openTasks = tasks.filter(t => t.status !== "DONE").length;

  return (
    <div className="space-y-4">
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
          <ul className="text-sm text-slate-600 list-disc ml-5 space-y-1">
            <li>Delays, low stock, and exceptions will appear here.</li>
          </ul>
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
