import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as OrdersAPI from "../api/orders";
import { Table } from "../components/Table";
import Badge from "../components/Badge";
import { isOrderFulfilled } from "../utils/orderStatus";

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: OrdersAPI.fetchOrders,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Orders</h2>

      <Table
        headers={[
          "Order",
          "Customer",
          "Delivery",
          "Status",
          "Boxes",
          "Delivered",
          "Created",
        ]}
      >
        {orders.map((o) => (
          <tr key={o.id} className="border-t border-slate-100">
            <td className="px-4 py-3">
              <Link to={`/orders/${o.id}`} className="text-slate-900 font-medium hover:underline">
                {o.id}
              </Link>
            </td>
            <td className="px-4 py-3">{o.customerName}</td>
            <td className="px-4 py-3 text-sm text-slate-600">
              {o.destination?.city
                ? `${o.destination.street ?? ""}${o.destination.street ? ", " : ""}${o.destination.city}, ${
                    o.destination.province ?? ""
                  } ${o.destination.postal ?? ""} (${o.destination.lat?.toFixed?.(2)}, ${o.destination.lng?.toFixed?.(2)})`
                : "Unknown"}
            </td>
            <td className="px-4 py-3">
              {(() => {
                const fulfilled = isOrderFulfilled(o as any);
                console.log("[ORDERS PAGE] isOrderFulfilled:", o.id, fulfilled);
                console.log("[ORDERS PAGE] order tasks:", o.id, (o as any).tasks);
                return <Badge>{fulfilled ? "Fulfilled" : "In Progress"}</Badge>;
              })()}
            </td>
            <td className="px-4 py-3">{o.boxes?.length ?? 0}</td>
            <td className="px-4 py-3">
              {(() => {
                const total = o.boxes?.length ?? 0;
                const delivered = o.boxes?.filter((b) => b.state === "DELIVERED").length ?? 0;
                return `${delivered} / ${total}`;
              })()}
            </td>
            <td className="px-4 py-3 text-slate-500 text-xs">
              {new Date(o.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
