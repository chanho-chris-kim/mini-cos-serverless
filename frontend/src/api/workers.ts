import api from "./apiClient";
import type { Worker } from "../lib/types";

export async function fetchWorkers(): Promise<Worker[]> {
  const res = await api.get("/workers");
  return res.data;
}
