// frontend/src/api/returns.ts
import api from "./apiClient";
import type { Box, ReturnCategory } from "../lib/types";

/**
 * GET /returns
 * Returns all boxes currently in the returns/QA pipeline.
 */
export async function fetchReturns(): Promise<Box[]> {
  const res = await api.get("/returns");
  return res.data;
}

/**
 * POST /returns/:boxId/classify
 * Classify the return after QA inspection.
 */
export async function classifyReturn(
  boxId: string,
  category: ReturnCategory,
  notes?: string
) {
  const res = await api.post(`/returns/${boxId}/classify`, {
    category,
    notes,
  });
  return res.data;
}

/**
 * POST /returns/scan
 * Used when a returned box arrives at the warehouse.
 */
export async function scanReturn(
  boxId: string,
  userId: string,
  warehouseId: string
) {
  const res = await api.post(`/returns/scan`, {
    boxId,
    userId,
    warehouseId,
  });
  return res.data;
}
