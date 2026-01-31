import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "CREATED",
        "STATUS_CHANGED",
        "PRIORITY_CHANGED",
        "ASSIGNED",
        "UPDATED",
      ],
      required: true,
    },
    field: String,      
    oldValue: String,
    newValue: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  priority: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  activityLogs: [activitySchema],
}, { timestamps: true });


export default mongoose.model("Ticket", ticketSchema);
