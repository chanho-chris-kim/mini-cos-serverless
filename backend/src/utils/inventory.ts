import inventory from "../../../shared/inventory.json";

export type InventoryMap = Record<string, number>;

export const INVENTORY: InventoryMap = { ...inventory };
