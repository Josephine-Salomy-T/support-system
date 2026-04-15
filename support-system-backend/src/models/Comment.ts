import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  ticketId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: "admin" | "agent" | "employee";
  message: string;
  createdAt: Date;
}

const commentSchema: Schema<IComment> = new Schema({
  ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  userRole: { type: String, enum: ["admin", "agent", "employee"], required: true },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IComment>("Comment", commentSchema);

