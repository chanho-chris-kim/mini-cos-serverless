// frontend/src/simulator/generators/generateReturn.ts
import { useSimStore } from "../store";
import { getReturnCandidates, classifyReturn } from "../../api/returns";

export async function generateReturn() {
  const log = useSimStore.getState().log;

  const boxes = await getReturnCandidates();
  if (boxes.length === 0) {
    log("No returnable boxes");
    return;
  }

  const box = boxes[Math.floor(Math.random() * boxes.length)];

  const categories = ["DAMAGED", "REFURBISH", "RESTOCK"];
  const category = categories[Math.floor(Math.random() * categories.length)];

  await classifyReturn(box.id, category);

  log(`Return processed: ${box.id} → ${category}`);
}
