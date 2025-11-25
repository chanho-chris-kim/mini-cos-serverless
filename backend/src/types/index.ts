import type { BoxState, ReturnCategory } from "../domain/orders/box.model";

export interface Address {
  line1: string;
  city: string;
  postal: string;
  lat: number;
  lng: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  homeAddress: Address;
  deliveryAddress: Address;
}

export interface Worker {
  id: string;
  name: string;

  role: "PICKER" | "PACKER" | "SHIPPER" | "DRIVER" | "QA";

  maxTasks: number;
  currentTasks: number;

  warehouseId?: string;

  homeBase: Address;

  activeTaskIds?: string[];
}

export interface Warehouse {
  id: string;
  name: string;
  location: Address;
  inventory: Record<string, number>;
}

// Optional shared view types
export type { BoxState, ReturnCategory };
