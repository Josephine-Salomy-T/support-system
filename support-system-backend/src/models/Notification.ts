import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  ticket: mongoose.Types.ObjectId;
  type: "assigned" | "status_changed" | "priority_changed" | "comment" | "reassigned";
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema: Schema<INotification> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  ticket: { type: Schema.Types.ObjectId, ref: "Ticket" },
  type: { type: String, enum: ["assigned", "status_changed", "priority_changed", "comment", "reassigned"], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>("Notification", notificationSchema);
