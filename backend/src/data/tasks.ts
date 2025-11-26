// backend/src/data/tasks.ts
import type { TaskEntity } from "../domain/tasks/task.model";

export const tasks: TaskEntity[] = [
  {
    id: "T-1",
    orderId: "O-10021",
    boxId: "B-1",
    warehouseId: "wh1",
    workerId: "w1",
    status: "PENDING_PICK",
    createdAt: "2025-11-23T13:00:00Z",
  },
  {
    id: "T-2",
    orderId: "O-10021",
    boxId: "B-2",
    warehouseId: "wh1",
    workerId: "w2",
    status: "IN_PROGRESS",
    createdAt: "2025-11-23T13:30:00Z",
  },
  {
    id: "T-3",
    orderId: "O-10022",
    boxId: "B-3",
    warehouseId: "wh1",
    workerId: null,
    status: "PENDING_PICK",
    createdAt: "2025-11-23T14:00:00Z",
  },
];
