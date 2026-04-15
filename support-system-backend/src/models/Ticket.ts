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
        "REASSIGNED",
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
  ticketNumber: { 
    type: Number, 
    unique: true,
    sparse: true
  },
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

ticketSchema.pre('save', async function () {
  if (this.isNew) {
    const lastTicket = await mongoose.model('Ticket')
      .findOne({}, {}, { sort: { ticketNumber: -1 } });
    (this as any).ticketNumber = lastTicket?.ticketNumber 
      ? (lastTicket.ticketNumber as number) + 1 
      : 1001;
  }
});






export default mongoose.model("Ticket", ticketSchema);
