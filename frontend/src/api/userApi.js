import axios from "axios";

export const userApi = axios.create({
  baseURL: "http://localhost:5000",
});

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
