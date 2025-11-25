import { api } from "./apiClient";
import type { ReturnCategory, Box } from "../lib/types";

export async function scanReturn(payload: {
  boxId: string;
  userId: string;
  warehouseId: string;
}): Promise<Box> {
  const res = await api.post("/returns/scan", payload);
  return res.data;
}

export async function classifyReturn(boxId: string, category: ReturnCategory): Promise<Box> {
  const res = await api.post(`/returns/${boxId}/classify`, { category });
  return res.data;
}
