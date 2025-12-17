import { useQuery } from "@tanstack/react-query";
import { fetchAllReturns } from "../api/returns";
import { Table } from "../components/Table";
import Badge from "../components/Badge";
import type { ReturnItem } from "../lib/types";
import { useNavigate } from "react-router-dom";

const queryDefaults = {
  refetchInterval: 2000,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
  staleTime: 0,
  cacheTime: 0,
};

function fmt(ts?: string) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function ReturnsDashboard() {
  const navigate = useNavigate();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["returns", "all"],
    queryFn: fetchAllReturns,
    ...queryDefaults,
  });

  if (isLoading) return <div>Loading returns…</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Returns Dashboard</h2>
          <div className="text-sm text-slate-500">Live QA / classification</div>
        </div>
      </div>

      <Table
        headers={[
          "Box ID",
          "Order ID",
          "SKU",
          "Customer",
          "Warehouse",
          "State",
          "Category",
          "Received",
          "QA Start",
          "Classified",
          "Action",
        ]}
      >
        {items.map((r: ReturnItem) => (
          <tr key={r.boxId} className="border-t border-slate-100">
            <td className="px-4 py-3 font-mono text-xs">{r.boxId}</td>
            <td className="px-4 py-3">{r.orderId}</td>
            <td className="px-4 py-3">{r.sku}</td>
            <td className="px-4 py-3">{r.customerName ?? "—"}</td>
            <td className="px-4 py-3">{r.warehouseId ?? "—"}</td>
            <td className="px-4 py-3">
              <Badge>{r.state}</Badge>
            </td>
            <td className="px-4 py-3">{r.category ?? "—"}</td>
            <td className="px-4 py-3 text-xs text-slate-600">{fmt(r.createdAt)}</td>
            <td className="px-4 py-3 text-xs text-slate-600">{fmt(r.qaStartedAt)}</td>
            <td className="px-4 py-3 text-xs text-slate-600">{fmt(r.classifiedAt)}</td>
            <td className="px-4 py-3">
              <button
                className="text-sm text-slate-700 hover:underline"
                onClick={() => navigate(`/returns/${r.boxId}`)}
              >
                View details
              </button>
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr>
            <td colSpan={11} className="px-4 py-3 text-sm text-slate-500">
              No returns yet.
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
}
