// frontend/src/simulator/engine.ts
import { useSimStore } from "./store";
import { runOneSimulationTick } from "./runTick";

let interval: NodeJS.Timeout | null = null;

export function startSimulatorEngine() {
  const sim = useSimStore.getState();

  // Start loop
  if (!interval) {
    interval = setInterval(() => {
      const { auto, forceStep, speed } = useSimStore.getState();

      if (!auto && forceStep === 0) return; // nothing to do

      useSimStore.setState({ forceStep: 0 }); // reset

      runOneSimulationTick();

    }, sim.speed);
  }
}

export function stopSimulatorEngine() {
  if (interval) clearInterval(interval);
  interval = null;
}
