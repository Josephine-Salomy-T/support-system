import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getAdminDashboard = (token: string) =>
  API.get("/dashboard/admin", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAgentDashboard = (token: string) =>
  API.get("/dashboard/agent", {
    headers: { Authorization: `Bearer ${token}` },
  });
