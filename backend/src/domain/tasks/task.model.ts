export type TaskType = "PICK" | "PACK" | "SHIP" | "QA" | "REFURBISH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";

export interface TaskEntity {
  id: string;
  warehouseId: string;
  type: TaskType;
  boxId: string;         // tie tasks to physical boxes
  assignedTo?: string;   // workerId
  status: TaskStatus;
  dueAt: string;
}