import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as OrdersAPI from "../api/orders";
import Badge from "../components/Badge";

export default function OrderDetail() {
  const { id = "" } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => OrdersAPI.fetchOrder(id),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading order...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{order.id}</h2>
        <Badge>{order.status}</Badge>
      </div>

      {order.routes && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="text-sm font-medium">Warehouse Routes</div>
          <div className="text-sm text-slate-600 mt-2 space-y-1">
            {Object.entries(order.routes).map(([wh, boxIds]) => (
              <div key={wh}>
                <span className="font-semibold">{wh}</span>: {boxIds.join(", ")}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {order.boxes?.map((b) => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">{b.id}</div>
              <Badge>{b.state}</Badge>
            </div>
            <div className="text-sm text-slate-600 mt-2">SKU: {b.sku}</div>
            <div className="text-xs text-slate-500 mt-1">WH: {b.warehouseId ?? "TBD"}</div>
            {b.trackingNumber && (
              <div className="text-xs text-slate-500 mt-1">Tracking: {b.trackingNumber}</div>
            )}
            {b.returnCategory && (
              <div className="text-xs text-slate-500 mt-1">Return: {b.returnCategory}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
