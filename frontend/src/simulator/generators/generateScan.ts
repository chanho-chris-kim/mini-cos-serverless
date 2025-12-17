// frontend/src/simulator/generators/generateScan.ts
import { useSimStore } from "../store";
import { fetchTasks, updateTaskStatus } from "../../api/tasks";

const delay = (min: number, max: number) =>
  new Promise((res) => setTimeout(res, min + Math.random() * (max - min)));

export async function generateScan() {
  const log = useSimStore.getState().log;

  const tasks = await fetchTasks();
  console.log("[SIM SCAN] tasks from API", tasks);
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  const pendingPick = tasks.filter((t) => t.status === "PENDING_PICK");
  console.log("[SIM SCAN] inProgress", inProgress);
  console.log("[SIM SCAN] pendingPick", pendingPick);

  const task = inProgress[0] ?? pendingPick[0];

  if (!task) {
    log("No tasks to scan");
    return;
  }

  // If task isn't started yet, move it to IN_PROGRESS first
  if (task.status === "PENDING_PICK") {
    await updateTaskStatus(task.id, "IN_PROGRESS");
  }

  if (task.type === "PICK" && task.status !== "DONE") {
    await delay(3000, 10000);
    await updateTaskStatus(task.id, "DONE");
    const packTask = tasks.find(
      (t) => t.orderId === task.orderId && t.type === "PACK"
    );
    if (packTask) {
      await updateTaskStatus(packTask.id, "IN_PROGRESS");
    }
    log(`Scanned PICK task ${task.id} → PACK started`);
    return;
  }

  if (task.type === "PACK" && task.status !== "DONE") {
    await delay(4000, 12000);
    await updateTaskStatus(task.id, "DONE");
    const shipTask = tasks.find(
      (t) => t.orderId === task.orderId && t.type === "SHIP"
    );
    if (shipTask) {
      await updateTaskStatus(shipTask.id, "IN_PROGRESS");
    }
    log(`Scanned PACK task ${task.id} → SHIP started`);
    return;
  }

  if (task.type === "SHIP" && task.status !== "DONE") {
    await delay(6000, 20000);
    await updateTaskStatus(task.id, "DONE");
    log(`Scanned SHIP task ${task.id} → DONE`);
    return;
  }

  log(`Task ${task.id} already completed`);
}
