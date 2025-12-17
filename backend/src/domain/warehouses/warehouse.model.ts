import type { Address } from "../../types";

export interface WarehouseEntity {
  id: string;
  name: string;

  location: Address;

  /** Product inventory by SKU */
  inventory: Record<string, number>;

  /** Workers physically located in this warehouse (for analytics only) */
  activeWorkerCount: number;

  /** Max orders/tasks this warehouse can process per day */
  dailyCapacity: number;

  createdAt: string;
  updatedAt: string;
}
