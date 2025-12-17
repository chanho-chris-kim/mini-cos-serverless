import { useLowStock } from "../hooks/useLowStock";

export default function LowStockBanner() {
  const { data: lowStock = [] } = useLowStock();

  const entries = (lowStock as any[]).filter(
    (w) => w.lowStock && w.lowStock.length > 0
  );

  if (entries.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl px-4 py-2 text-sm">
      <div className="font-semibold mb-1">🔴 Low Stock Alert</div>
      <div className="space-y-1">
        {entries.map((entry) => (
          <div key={entry.warehouseId}>
            {entry.warehouseId}:{" "}
            {entry.lowStock
              .map((i: any) => `${i.sku} (${i.qty})`)
              .join(", ")}
          </div>
        ))}
      </div>
    </div>
  );
}
