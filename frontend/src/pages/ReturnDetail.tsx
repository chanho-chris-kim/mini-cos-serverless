import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReturnDetail, startQA, classifyReturn, markRestocked } from "../api/returns";
import type { ReturnDetail } from "../lib/types";
import Badge from "../components/Badge";
import { useState } from "react";
import { useUserStore } from "../lib/store";

const queryDefaults = {
  refetchInterval: 2000,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: true,
  staleTime: 0,
  cacheTime: 0,
};

function fmt(ts?: string) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

const allowedClassifications = ["FULL_PRICE", "DISCOUNT", "DISPOSE"];

export default function ReturnDetail() {
  const { boxId = "" } = useParams();
  const qc = useQueryClient();
  const user = useUserStore((s) => s.user);
  const [category, setCategory] = useState<string>("FULL_PRICE");
  const [notes, setNotes] = useState<string>("");

  const { data: detail, isLoading } = useQuery<ReturnDetail>({
    queryKey: ["returns", boxId],
    queryFn: () => fetchReturnDetail(boxId),
    enabled: !!boxId,
    ...queryDefaults,
  });

  const startQAMutation = useMutation({
    mutationFn: () => startQA(boxId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["returns", boxId] }),
  });

  const classifyMutation = useMutation({
    mutationFn: () => classifyReturn(boxId, category, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["returns", boxId] }),
  });

  const restockMutation = useMutation({
    mutationFn: () => markRestocked(boxId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["returns", boxId] }),
  });

  if (isLoading || !detail) return <div>Loading return…</div>;

  const canOperate =
    user?.role === "ADMIN" || user?.role === "OPS_MANAGER" || user?.role === "WAREHOUSE_MANAGER";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">Box</div>
          <div className="text-xl font-semibold">{detail.boxId}</div>
          <div className="text-sm text-slate-600">SKU: {detail.sku}</div>
        </div>
        <div className="flex items-center gap-2">
          {detail.warehouseId && <Badge>{detail.warehouseId}</Badge>}
          <Badge>{detail.state}</Badge>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 text-sm">
        <div className="font-semibold text-slate-700">Customer & Destination</div>
        <div>{detail.customerName ?? "Unknown customer"}</div>
        <div>{detail.destinationAddress ?? "Unknown address"}</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
        <div className="font-semibold text-sm">Lifecycle</div>
        <div className="space-y-2 text-sm">
          <TimelineItem label="RETURN_RECEIVED" time={detail.timeline?.receivedAt} />
          <TimelineItem label="QA_IN_PROGRESS" time={detail.timeline?.qaStartedAt} />
          <TimelineItem
            label="RETURN_CLASSIFIED"
            time={detail.timeline?.classifiedAt}
            extra={detail.category}
          />
          <TimelineItem label="RESTOCK" time={detail.timeline?.restockedAt} />
        </div>
      </div>

      {canOperate && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="font-semibold text-sm">Actions</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded bg-slate-900 text-white text-sm hover:bg-slate-700"
              onClick={() => startQAMutation.mutate()}
            >
              Start QA
            </button>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {allowedClassifications.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              className="px-3 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-500"
              onClick={() => classifyMutation.mutate()}
            >
              Classify Return
            </button>
            {(detail.category === "FULL_PRICE" || detail.category === "DISCOUNT") &&
              !detail.timeline?.restockedAt && (
                <button
                  className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-500"
                  onClick={() => restockMutation.mutate()}
                >
                  Mark Restocked
                </button>
              )}
          </div>
          <textarea
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

function TimelineItem({
  label,
  time,
  extra,
}: {
  label: string;
  time?: string;
  extra?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-1 h-2 w-2 rounded-full bg-slate-700" />
      <div>
        <div className="font-semibold text-slate-800 text-sm">
          {label} {extra ? `— ${extra}` : ""}
        </div>
        <div className="text-xs text-slate-500">{fmt(time)}</div>
      </div>
    </div>
  );
}
