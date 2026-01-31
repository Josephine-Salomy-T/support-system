import mongoose from "mongoose";
import dotenv from "dotenv";
import Ticket from "./models/Ticket";
import User from "./models/User";

dotenv.config();

const fixOldTickets = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected...");

    const agent = await User.findOne({ role: "agent" });
    if (!agent) throw new Error("No agent found");

    const result = await Ticket.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: agent._id } }
    );

    console.log(`Tickets updated: ${result.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Fix failed:", err);
    process.exit(1);
  }
};

fixOldTickets();
