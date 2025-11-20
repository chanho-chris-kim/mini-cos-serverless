import { useState } from "react";
import type { Order } from "../../types";

interface Props {
  orders: Order[];
  onDeleteOrder: (orderId: string) => Promise<void>;
}

export default function OrdersTable({ orders, onDeleteOrder }: Props) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  if (orders.length === 0)
    return (
      <p className="text-text-secondary mb-4">
        No orders yet — create one below!
      </p>
    );

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      setDeletingIds(new Set(deletingIds).add(orderId));
      await onDeleteOrder(orderId);
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    } finally {
      const newSet = new Set(deletingIds);
      newSet.delete(orderId);
      setDeletingIds(newSet);
    }
  };

  return (
    <div className="overflow-x-auto mb-6 rounded-lg shadow">
      <table className="min-w-full border border-text-accent rounded-lg">
        <thead className="bg-primary-hover text-secondary">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium">Customer</th>
            <th className="py-3 px-4 text-left text-sm font-medium">Items</th>
            <th className="py-3 px-4 text-sm font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              className="hover:bg-secondary-hover transition-colors duration-150"
            >
              <td className="py-2 px-4 border-b">{o.customer.name}</td>
              <td className="py-2 px-4 border-b">
                {o.items.map((i) => `${i.sku} (${i.qty})`).join(", ")}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleDelete(o.id)}
                  disabled={deletingIds.has(o.id)}
                  aria-label={`Delete order ${o.id}`}
                  className={`px-4 py-1 rounded-full text-secondary font-medium shadow-sm transition-colors duration-150 ${
                    deletingIds.has(o.id)
                      ? "bg-secondary hover:bg-secondary-hover cursor-not-allowed"
                      : "bg-accent hover:bg-accent-hover"
                  }`}
                >
                  {deletingIds.has(o.id) ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
