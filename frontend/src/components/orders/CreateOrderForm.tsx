import { useState } from "react";
import type { Item } from "../../types";
import * as OrdersAPI from "../../api/orders";

interface Props {
  onOrderCreated: () => void;
}

export default function CreateOrderForm({ onOrderCreated }: Props) {
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<Item[]>([{ sku: "", qty: 1 }]);
  const [loading, setLoading] = useState(false);

  // Capitalize words
  const toCapitalCase = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const updateItem = (index: number, key: "sku" | "qty", value: string) => {
    const newItems = [...items];
    if (key === "qty") {
      newItems[index][key] = Math.max(0, parseInt(value) || 0);
    } else {
      newItems[index][key] = value;
    }
    setItems(newItems);
  };

  const addItemRow = () => setItems([...items, { sku: "", qty: 1 }]);

  const handleCreateOrder = async () => {
    if (!items.every((i) => i.sku.trim() !== "")) {
      alert("All items must have a SKU");
      return;
    }

    // 🔥 Merge duplicate SKUs
    const mergedItemsMap: Record<string, number> = {};

    items.forEach((item) => {
      const sku = item.sku.trim().toUpperCase(); // normalize SKU
      if (!mergedItemsMap[sku]) mergedItemsMap[sku] = 0;
      mergedItemsMap[sku] += item.qty;
    });

    const mergedItems: Item[] = Object.entries(mergedItemsMap).map(
      ([sku, qty]) => ({ sku, qty })
    );

    setLoading(true);
    try {
      await OrdersAPI.createOrder(
        toCapitalCase(customerName || "Anonymous"),
        mergedItems
      );

      setCustomerName("");
      setItems([{ sku: "", qty: 1 }]);
      onOrderCreated();
    } catch (err) {
      console.error(err);
      alert("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primaryHover p-4 rounded-lg shadow mb-4">
      <h3 className="text-xl font-semibold mb-3 text-secondary">
        Create Order
      </h3>

      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        onBlur={() => setCustomerName(toCapitalCase(customerName))}
        className="border rounded px-3 py-2 mb-3 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="space-y-2 mb-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="SKU"
              value={item.sku}
              onChange={(e) => updateItem(idx, "sku", e.target.value)}
              className="border rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateItem(idx, "qty", `${item.qty - 1}`)}
                className="px-4 py-1 bg-secondary hover:bg-secondary-hover text-text-primary rounded-l-full shadow-sm transition-colors text-xl"
              >
                -
              </button>
              <input
                type="text"
                value={item.qty}
                onChange={(e) => updateItem(idx, "qty", e.target.value)}
                className="w-16 text-center border-t border-b border-secondary rounded-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => updateItem(idx, "qty", `${item.qty + 1}`)}
                className="px-4 py-1 bg-secondary hover:bg-secondary-hover text-text-primary rounded-r-full shadow-sm transition-colors text-xl"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addItemRow}
        className="bg-secondary hover:bg-secondary-hover text-text-primary px-3 py-1 rounded mb-3"
      >
        Add Item
      </button>

      <div className="flex gap-2">
        <button
          onClick={handleCreateOrder}
          disabled={loading}
          className={`bg-primary hover:bg-primary-hover text-secondary px-4 py-2 rounded ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Creating..." : "Create Order"}
        </button>
      </div>
    </div>
  );
}
