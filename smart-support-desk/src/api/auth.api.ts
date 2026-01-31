import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const loginRequest = (data: { email: string; password: string }) =>
  API.post("/users/login", data);
