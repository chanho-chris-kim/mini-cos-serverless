// frontend/src/simulator/store.ts
import { create } from "zustand";
import { fetchSKUs } from "../api/skus";

interface SimulatorState {
  auto: boolean;
  speed: number; // ms per tick
  logs: string[];
  skus: string[];

  setAuto: (v: boolean) => void;
  setSpeed: (v: number) => void;
  log: (msg: string) => void;
  clearLogs: () => void;
  loadSkus: () => Promise<void>;

  forceStep: number;
  triggerStep: () => void;
}

export const useSimStore = create<SimulatorState>((set) => ({
  auto: false,
  speed: 1500,
  logs: [],
  skus: [],
  forceStep: 0,

  setAuto: (v) => set({ auto: v }),
  setSpeed: (v) => set({ speed: v }),

  log: (msg) =>
    set((s) => ({
      logs: [`${new Date().toISOString()} — ${msg}`, ...s.logs].slice(0, 200),
    })),

  clearLogs: () => set({ logs: [] }),

  loadSkus: async () => {
    console.log("[SIM] loading SKUs...");
    const skus = await fetchSKUs();
    console.log("[SIM] SKUs loaded:", skus);
    set({ skus });
  },

  triggerStep: () => set((s) => ({ forceStep: s.forceStep + 1 })),
}));
