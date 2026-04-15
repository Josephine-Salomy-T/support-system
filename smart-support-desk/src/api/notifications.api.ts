import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getNotifications = (token: string) =>
  API.get("/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const markNotificationRead = (id: string, token: string) =>
  API.post(
    `/notifications/read/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const markAllNotificationsRead = (token: string) =>
  API.post(
    "/notifications/read-all",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

