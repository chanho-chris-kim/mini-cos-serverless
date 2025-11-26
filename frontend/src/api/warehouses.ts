import api from "./apiClient";
import type { Warehouse } from "../lib/types";

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const res = await api.get("/warehouses");
  return res.data;
}
