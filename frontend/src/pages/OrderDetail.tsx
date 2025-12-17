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
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
  });

  if (isLoading) return <div>Loading order...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{order.id}</h2>
        <Badge>{order.status}</Badge>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 text-sm">
        <div className="font-semibold text-slate-700">Customer: {order.customerName}</div>
        <div className="text-slate-600">
          <div className="font-semibold">Delivery Address</div>
          <div>
            Address:{" "}
            {order.destination
              ? `${order.destination.street ?? order.destination.city ?? "Unknown"}, ${order.destination.city ?? ""}${
                  order.destination.province ? `, ${order.destination.province}` : ""
                } ${order.destination.postal ?? ""}`
              : "Unknown"}
          </div>
          <div>Latitude: {order.destination?.lat ?? "Unknown"}</div>
          <div>Longitude: {order.destination?.lng ?? "Unknown"}</div>
        </div>
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
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-600 mb-1">Pipeline</div>
              <div className="flex items-center gap-2 text-xs">
                {["PICK", "PACK", "SHIP", "DELIVERED"].map((stage) => {
                  const active =
                    (stage === "PICK" && ["PENDING", "PICK_ASSIGNED", "PICKED", "PACKED", "OUTBOUND", "DELIVERED"].includes(b.state)) ||
                    (stage === "PACK" && ["PACKED", "OUTBOUND", "DELIVERED"].includes(b.state)) ||
                    (stage === "SHIP" && ["OUTBOUND", "DELIVERED"].includes(b.state)) ||
                    (stage === "DELIVERED" && b.state === "DELIVERED");
                  return (
                    <div
                      key={stage}
                      className={`px-2 py-1 rounded-full border ${
                        active ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {stage}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
