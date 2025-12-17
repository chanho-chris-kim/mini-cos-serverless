import { api } from "./apiClient";

export async function getLowStock() {
  const res = await api.get("/analytics/low-stock");
  return res.data;
}

export async function fetchOverview() {
  const res = await api.get("/analytics/overview");
  return res.data;
}

export async function fetchLowStock() {
  const res = await api.get("/analytics/low-stock");
  return res.data;
}

export async function fetchSlaMetrics() {
  const res = await api.get("/analytics/sla");
  return res.data.sla ?? res.data;
}

export async function fetchReturnMetrics() {
  const res = await api.get("/analytics/returns");
  return res.data.returns ?? res.data;
}
