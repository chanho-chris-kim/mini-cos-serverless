import { useState } from "react";
import Badge from "../components/Badge";
import type { ReturnCategory, User } from "../lib/types";

const categories: { key: ReturnCategory; label: string; hint: string }[] = [
  { key: "FULL_PRICE", label: "Full Price", hint: "Like-new, restock normally" },
  { key: "DISCOUNT", label: "Discount", hint: "Minor damage, open-box deals" },
  { key: "REFURBISH", label: "Refurbish", hint: "Needs repair/cleaning" },
  { key: "SALVAGE", label: "Salvage", hint: "Use for parts" },
  { key: "TRASH", label: "Trash", hint: "Dispose / recycle" },
];

export default function Returns({ user }: { user: User | null }) {
  const [returnBoxId, setReturnBoxId] = useState("");
  const [stage, setStage] = useState<"INTAKE" | "QA">("INTAKE");
  const [selected, setSelected] = useState<ReturnCategory | null>(null);

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Returns</h2>
        <div className="text-sm text-slate-500">Return intake → QA → classification</div>
      </div>

      {stage === "INTAKE" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="font-medium text-sm">Return Intake Scan</div>
          <input
            value={returnBoxId}
            onChange={(e) => setReturnBoxId(e.target.value)}
            placeholder="Scan return box id (e.g., R-9)"
            className="w-full border border-slate-300 rounded-xl px-3 py-3 text-lg"
          />
          <button
            onClick={() => setStage("QA")}
            className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm hover:bg-slate-700"
          >
            Mark RETURN_RECEIVED → QA_PENDING
          </button>
          <div className="text-xs text-slate-500">
            Note: /returns endpoints are scaffolded in frontend but not implemented in backend yet.
          </div>
        </div>
      )}

      {stage === "QA" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">QA Classification</div>
              <div className="text-xs text-slate-500">Box: {returnBoxId || "R-9"}</div>
            </div>
            <Badge>QA_IN_PROGRESS</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelected(c.key)}
                className={`text-left border rounded-2xl p-4 hover:bg-slate-50 ${
                  selected === c.key ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="font-semibold">{c.label}</div>
                <div className="text-xs text-slate-500 mt-1">{c.hint}</div>
              </button>
            ))}
          </div>

          <button
            disabled={!selected}
            onClick={() => alert(`RETURN_CLASSIFIED → ${selected}`)}
            className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm hover:bg-slate-700 disabled:opacity-50"
          >
            Confirm Classification
          </button>
        </div>
      )}
    </div>
  );
}
