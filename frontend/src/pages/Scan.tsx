import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as ScanAPI from "../api/scan";
import Badge from "../components/Badge";
import type { User } from "../lib/types";

export default function Scan({ user }: { user: User | null }) {
  const [boxId, setBoxId] = useState("");
  const [zone, setZone] = useState<"PICKING"|"PACKING"|"SHIPPING">("PICKING");

  const scanMutation = useMutation({ mutationFn: ScanAPI.scanBox });

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Scan Box</h2>
        <div className="text-sm text-slate-500">Zone-aware auto transition</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <label className="text-xs text-slate-600">Zone</label>
        <select
          value={zone}
          onChange={(e) => setZone(e.target.value as any)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="PICKING">Picking</option>
          <option value="PACKING">Packing</option>
          <option value="SHIPPING">Shipping</option>
        </select>

        <label className="text-xs text-slate-600">Scan barcode / Box ID</label>
        <input
          value={boxId}
          onChange={(e) => setBoxId(e.target.value)}
          placeholder="e.g., B-4"
          className="w-full border border-slate-300 rounded-xl px-3 py-3 text-lg"
        />

        <button
          onClick={() =>
            scanMutation.mutate({
              userId: user.id,
              boxId,
              warehouseId: user.warehouseId || "W-MTL",
              zone,
            })
          }
          className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm hover:bg-slate-700"
        >
          Scan
        </button>

        {scanMutation.data && (
          <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <Badge>{scanMutation.data.newState}</Badge>
              <div className="text-sm">{scanMutation.data.message}</div>
            </div>
          </div>
        )}

        {!scanMutation.data && (
          <div className="text-xs text-slate-500">
            Note: /scan endpoint is scaffolded in frontend but not implemented in backend yet.
          </div>
        )}
      </div>
    </div>
  );
}
