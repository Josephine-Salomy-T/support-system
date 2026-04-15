import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getUsers = (token: string) =>
  API.get("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
