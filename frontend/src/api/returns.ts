// frontend/src/api/returns.ts
import { api } from "./apiClient";

export async function getReturnCandidates() {
  const res = await api.get("/returns");
  return res.data;
}

export async function classifyReturn(
  boxId: string,
  category: string,
  notes?: string
) {
  const res = await api.post(`/returns/${boxId}/classify`, {
    category,
    notes,
  });
  return res.data;
}

export async function fetchAllReturns() {
  const res = await api.get("/returns/all");
  return res.data;
}

export async function fetchReturnDetail(boxId: string) {
  const res = await api.get(`/returns/detail/${boxId}`);
  return res.data;
}

export async function startQA(boxId: string) {
  const res = await api.post(`/returns/${boxId}/start-qa`);
  return res.data;
}

export async function markRestocked(boxId: string) {
  const res = await api.post(`/returns/${boxId}/restock`);
  return res.data;
}
