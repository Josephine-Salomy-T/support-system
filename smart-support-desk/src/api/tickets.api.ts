import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getTickets = (token: string) =>
  API.get("/tickets", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createTicket = (data: any, token: string) =>
  API.post("/tickets", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateTicket = (id: string, data: any, token: string) =>
  API.put(`/tickets/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteTicket = (id: string, token: string) =>
  API.delete(`/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
