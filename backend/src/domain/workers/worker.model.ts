import type { Worker } from "../../types";

export type WorkerRole = Worker["role"];

export interface WorkerEntity extends Worker {
  zone: "PICKING" | "PACKING" | "SHIPPING" | "RETURNS" | "QA";
  activeTaskIds?: string[];
  // Backend-internal computed fields can go here
  createdAt: string;
  updatedAt: string;
}
