import { create } from "zustand";
import { runTick } from "../api/simulator";

interface SimulatorState {
  running: boolean;
  speed: number; // ms interval
  logs: string[];
  lastTick?: string;
  start: () => void;
  stop: () => void;
  step: () => Promise<void>;
  setSpeed: (ms: number) => void;
  _interval?: number | null;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  running: false,
  speed: 2000,
  logs: [],
  lastTick: undefined,
  _interval: null,

  start: () => {
    const { running, speed } = get();
    if (running) return;

    const interval = window.setInterval(() => {
      get().step();
    }, speed);

    set({ running: true, _interval: interval });
  },

  stop: () => {
    const id = get()._interval;
    if (id) clearInterval(id);
    set({ running: false, _interval: null });
  },

  setSpeed: (ms) => {
    const wasRunning = get().running;
    get().stop();
    set({ speed: ms });

    if (wasRunning) get().start();
  },

  step: async () => {
    try {
      const res = await runTick();

      set((s) => ({
        logs: [
          `[${res.timestamp}] ${res.events.join(" | ")}`,
          ...s.logs,
        ].slice(0, 50), // keep last 50
        lastTick: res.timestamp,
      }));
    } catch (err) {
      console.error("Simulator step failed:", err);
      set((s) => ({
        logs: ["[ERROR] Simulator failed", ...s.logs],
      }));
    }
  },
}));
