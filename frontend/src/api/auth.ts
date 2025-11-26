import api from "./apiClient";

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function fetchCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data.user;
}
