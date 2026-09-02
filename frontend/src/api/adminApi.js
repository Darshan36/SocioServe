import axios from "axios";

export const adminApi = axios.create({
  baseURL: "http://localhost:5000",
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
