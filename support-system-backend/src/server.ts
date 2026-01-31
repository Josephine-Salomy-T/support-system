import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import userRoutes from "./routes/user";
import ticketRoutes from "./routes/ticket";
import dashboardRoutes from "./routes/dashboard";


// import { authMiddleware } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Mongo Error:", err));

// Routes
app.use("/api/users", userRoutes);     
app.use("/api/tickets", ticketRoutes);  
app.use("/api/dashboard", dashboardRoutes);


app.get("/", (req, res) => res.send("API is running"));

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
