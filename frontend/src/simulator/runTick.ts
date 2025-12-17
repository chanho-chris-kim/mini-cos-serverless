// frontend/src/simulator/runTick.ts
import { generateOrder } from "./generators/generateOrder";
import { generateScan } from "./generators/generateScan";
import { generateReturn } from "./generators/generateReturn";
import { useSimStore } from "./store";

export async function runOneSimulationTick() {
  const log = useSimStore.getState().log;

  // Randomly choose the type of event
  const roll = Math.random();

  try {
    if (roll < 0.4) {       // 40% chance
      await generateOrder();
    } else if (roll < 0.75) { // 35% chance
      await generateScan();
    } else {                // 25% chance
      await generateReturn();
    }
  } catch (err) {
    log("Simulator error: " + (err as Error).message);
  }
}
