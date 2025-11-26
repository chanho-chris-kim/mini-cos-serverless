// backend/src/domain/tasks/task.model.ts
export type TaskType = "PICK" | "PACK" | "SHIP" | "QA" | "REFURBISH";
export type TaskStatus = "PENDING_PICK" | "IN_PROGRESS" | "DONE" | "FAILED";

export interface TaskEntity {
  id: string;
  orderId: string;
  boxId: string;
  warehouseId: string;
  workerId: string | null;
  status: TaskStatus;
  createdAt: string;
}
