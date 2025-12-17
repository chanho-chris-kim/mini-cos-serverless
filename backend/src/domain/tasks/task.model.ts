// backend/src/domain/tasks/task.model.ts
export type TaskType = "PICK" | "PACK" | "SHIP";
export type TaskStatus = "PENDING" | "PENDING_PICK" | "IN_PROGRESS" | "DONE" | "FAILED";

export interface TaskEntity {
  id: string;
  orderId: string;
  boxId: string;
  warehouseId: string;
  workerId: string | null;
  type: TaskType;
  status: TaskStatus;
  createdAt: string;
}
