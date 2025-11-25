import StatCard from "../components/StatCard";

export default function Analytics() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Analytics</h2>

      <div className="grid grid-cols-4 gap-3">
        <StatCard title="Avg Fulfillment Time" value="—" sub="coming soon" />
        <StatCard title="Split Shipment Rate" value="—" sub="coming soon" />
        <StatCard title="Return Rate (30d)" value="—" sub="coming soon" />
        <StatCard title="QA Full-Price Rate" value="—" sub="coming soon" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="font-semibold text-sm mb-2">Notes</div>
        <p className="text-sm text-slate-600">
          Charts and live metrics will be wired to COS event logs & DynamoDB streams.
        </p>
      </div>
    </div>
  );
}
