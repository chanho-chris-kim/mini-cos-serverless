import { useEffect, useState } from "react";
import type { WarehouseEvent } from "../api/warehouses";

export function useWarehouseEventsSSE(warehouseId?: string) {
  const [events, setEvents] = useState<WarehouseEvent[]>([]);
  const [reconnectToken, setReconnectToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const base = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const url = warehouseId
      ? `${base}/warehouses/${warehouseId}/events/stream`
      : `${base}/warehouses/stream`;

    const evt = new EventSource(url);

    evt.onmessage = (e) => {
      if (cancelled) return;
      const event = JSON.parse(e.data);
      setEvents((prev) => [event, ...prev].slice(0, 50));
    };

    evt.onerror = () => {
      console.warn("SSE disconnected, retrying in 2s…");
      evt.close();
      if (!cancelled) {
        setTimeout(() => setReconnectToken((r) => r + 1), 2000);
      }
    };

    return () => {
      cancelled = true;
      evt.close();
    };
  }, [warehouseId, reconnectToken]);

  return events;
}
