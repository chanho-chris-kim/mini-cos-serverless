import { api } from "./apiClient";
import type { BoxState } from "../lib/types";

export async function scanBox(payload: {
  boxId: string;
  userId: string;
  warehouseId: string;
  zone: "PICKING" | "PACKING" | "SHIPPING";
}): Promise<{ newState: BoxState; message: string }> {
  const res = await api.post("/scan", payload);
  return res.data;
}
