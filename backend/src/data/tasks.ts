import type { TaskEntity } from "../domain/tasks/task.model";

export const tasks: TaskEntity[] = [
  {
    id: "T-1",
    warehouseId: "wh1",
    type: "PICK",
    status: "PENDING",
    boxId: "B-3",
    assignedTo: "w3",
    dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
];
