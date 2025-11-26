// frontend/src/api/apiClient.ts
import axios from "axios";
import { useUserStore } from "../lib/store";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Attach Authorization header automatically
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
