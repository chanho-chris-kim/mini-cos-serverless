import { useQuery } from "@tanstack/react-query";
import { getLowStock } from "../api/analytics";

export function useLowStock() {
  return useQuery({
    queryKey: ["analytics", "low-stock"],
    queryFn: getLowStock,
  });
}
