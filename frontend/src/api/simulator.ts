import { api } from "./apiClient";
import { useSimStore } from "../simulator/store";

export async function runTick(): Promise<{
  events: string[];
  timestamp: string;
}> {
  const now = Date.now();
  const { skus, loadSkus } = useSimStore.getState();
  if (!skus || skus.length === 0) {
    await loadSkus();
  }
  const skuList = useSimStore.getState().skus;
  const sku = skuList[Math.floor(Math.random() * skuList.length)];
  const payload = {
    orderId: `SIM-${now}`,
    customerName: "Simulator",
    destination: { lat: 45.5, lng: -73.56 },
    boxes: [{ id: `BOX-${now}`, sku }],
  };

  const res = await api.post("/simulator/orders", payload, {
    headers: {
      "x-sim-key": import.meta.env.VITE_SIMULATOR_KEY,
    },
  });
  const orderId = res.data?.order?.id ?? payload.orderId;

  return {
    events: [`Order ${orderId} created (SKU ${sku})`],
    timestamp: new Date().toISOString(),
  };
}
