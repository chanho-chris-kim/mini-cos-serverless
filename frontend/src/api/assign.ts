import api from "./apiClient";
export async function autoAssignTasks(): Promise<void> {
  await api.post("/assign");
}
