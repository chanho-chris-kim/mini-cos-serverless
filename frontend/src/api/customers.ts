import { api } from "./apiClient";
import type { Customer } from "../lib/types";

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await api.get("/customers");
  return res.data;
}
