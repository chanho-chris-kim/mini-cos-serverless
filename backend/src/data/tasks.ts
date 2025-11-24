import type { TaskEntity } from "../domain/tasks/task.model";

// In-memory store for tasks used by the repository
export const tasks: TaskEntity[] = [];
