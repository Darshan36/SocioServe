import axios from "axios";

// 1. Define and EXPORT the URL so other files can use it
export const API_BASE_URL = "http://localhost:5000";

export const maidApi = axios.create({
  baseURL: API_BASE_URL, // 2. Use the constant here
});

maidApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("maidToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});