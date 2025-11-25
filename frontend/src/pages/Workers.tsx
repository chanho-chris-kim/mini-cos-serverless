import { useQuery } from "@tanstack/react-query";
import * as WorkersAPI from "../api/workers";
import { Table } from "../components/Table";
import Badge from "../components/Badge";

export default function Workers() {
  const { data: workers = [], isLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: WorkersAPI.fetchWorkers,
  });

  if (isLoading) return <div>Loading workers...</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Workers</h2>
      <Table headers={["Worker", "Warehouse", "Zone", "Active Tasks"]}>
        {workers.map((w) => (
          <tr key={w.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-medium">{w.name}</td>
            <td className="px-4 py-3">{w.warehouseId}</td>
            <td className="px-4 py-3"><Badge>{w.zone || "—"}</Badge></td>
            <td className="px-4 py-3">{w.activeTaskIds?.length ?? 0}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
