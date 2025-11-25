import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as OrdersAPI from "../api/orders";
import { Table } from "../components/Table";
import Badge from "../components/Badge";

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: OrdersAPI.fetchOrders,
  });

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Orders</h2>

      <Table headers={["Order", "Customer", "Status", "Boxes", "Created"]}>
        {orders.map((o) => (
          <tr key={o.id} className="border-t border-slate-100">
            <td className="px-4 py-3">
              <Link to={`/orders/${o.id}`} className="text-slate-900 font-medium hover:underline">
                {o.id}
              </Link>
            </td>
            <td className="px-4 py-3">{o.customerName}</td>
            <td className="px-4 py-3"><Badge>{o.status}</Badge></td>
            <td className="px-4 py-3">{o.boxes?.length ?? 0}</td>
            <td className="px-4 py-3 text-slate-500 text-xs">
              {new Date(o.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
