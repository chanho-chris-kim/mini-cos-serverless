// frontend/src/pages/Returns.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../lib/store";
import * as ReturnsAPI from "../api/returns";
import type { Box, ReturnCategory } from "../lib/types";

export default function ReturnsPage() {
  const { user } = useUserStore();
  const qc = useQueryClient();

  const { data: boxes = [], isLoading, error } = useQuery({
    queryKey: ["returns"],
    queryFn: ReturnsAPI.fetchReturns,
  });

  const classifyMutation = useMutation({
    mutationFn: (params: { boxId: string; category: ReturnCategory; notes?: string }) =>
      ReturnsAPI.classifyReturn(params.boxId, params.category, params.notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["returns"] });
    },
  });

  if (isLoading) return <div>Loading returns…</div>;
  if (error) return <div>Error loading returns</div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Returns / QA</h2>
        <p className="text-sm text-slate-500">
          Logged in as <span className="font-medium">{user?.name}</span> ({user?.role})
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="font-semibold text-sm">Open Returns</div>
          <div className="text-xs text-slate-500">
            States: QA_PENDING / QA_IN_PROGRESS / QA_DONE
          </div>
        </div>

        {boxes.length === 0 ? (
          <div className="text-sm text-slate-500">No boxes in the return pipeline right now.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">Box ID</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Warehouse</th>
                <th className="py-2">State</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {boxes.map((b: Box) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="py-2 font-mono text-xs">{b.id}</td>
                  <td className="py-2">{b.sku}</td>
                  <td className="py-2">{b.warehouseId ?? "—"}</td>
                  <td className="py-2">{b.state}</td>
                  <td className="py-2">
                    <button
                      className="px-2 py-1 text-xs rounded bg-emerald-600 text-white mr-1"
                      onClick={() =>
                        classifyMutation.mutate({
                          boxId: b.id,
                          category: "FULL_PRICE",
                        })
                      }
                    >
                      Mark Full Price
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded bg-amber-500 text-white mr-1"
                      onClick={() =>
                        classifyMutation.mutate({
                          boxId: b.id,
                          category: "DISCOUNT",
                        })
                      }
                    >
                      Mark Discount
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded bg-slate-200 text-slate-800"
                      onClick={() =>
                        classifyMutation.mutate({
                          boxId: b.id,
                          category: "REFURBISH",
                        })
                      }
                    >
                      Send to Refurb
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
