import express from "express";
import Ticket from "../models/Ticket";
import User from "../models/User"
import Notification from "../models/Notification";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const router = express.Router();

const authMiddleware = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

async function createNotification(userId: string, ticketId: string, type: "assigned" | "status_changed" | "priority_changed" | "comment" | "reassigned", message: string) {
  await Notification.create({
    user: userId,
    ticket: ticketId,
    type,
    message,
  });
}



// GET tickets (Admin → all, Agent → own)
router.get("/", authMiddleware, async (req: Request & { user?: any }, res) => {
  try {
    const user = req.user;
    const tickets = await Ticket.find(
      user.role === "admin" ? {} : { assignedTo: user.id }
    )
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .populate("assignedTo", "name")
      .populate("activityLogs.performedBy", "name role")


    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// CREATE ticket 
// router.post("/", authMiddleware, async (req: Request & { user?: any }, res) => {

//   try {
//     const isAdmin = req.user!.role === "admin";
//     const newTicket = await Ticket.create({
//       ...req.body,
//       userId: req.user!.id,
//       assignedTo: isAdmin
//         ? req.body.assignedTo || null
//         : new mongoose.Types.ObjectId(req.user!.id),
//       activityLogs: [
//         {
//           action: "CREATED",
//           performedBy: req.user.id,
//         },
//       ],
//     })
//     const ticket = await Ticket.findById(newTicket._id)
//       .populate("userId", "name")
//       .populate("assignedTo", "name");
//     res.json(ticket);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to create ticket" });
//   }
// });

// CREATE ticket 
router.post("/", authMiddleware, async (req: Request & { user?: any }, res) => {
  try {
    const isAdmin = req.user!.role === "admin";
    const newTicket = await Ticket.create({
      ...req.body,
      userId: req.user!.id,
      assignedTo: isAdmin
        ? req.body.assignedTo || null
        : new mongoose.Types.ObjectId(req.user!.id),
      activityLogs: [
        {
          action: "CREATED",
          performedBy: req.user.id,
        },
      ],
    });

    // Fetch the newly created ticket with populated fields
    const ticket = await Ticket.findById(newTicket._id)
      .populate("userId", "name")
      .populate("assignedTo", "name");

    // 🔔 Notify assigned agent if ticket is assigned
    if (ticket?.assignedTo) {
      await createNotification(
        ticket.assignedTo._id.toString(),
        ticket._id.toString(),
        "assigned",
        "A new ticket has been assigned to you"
      );
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Failed to create ticket" });
  }
});


// UPDATE ticket 
// router.put("/:id", authMiddleware, async (req: Request & { user?: any }, res) => {
//   try {
//     console.log("Updating ticket:", req.params.id, req.body);

//     const ticket = await Ticket.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     )
//       .populate("userId", "name")
//       .populate("assignedTo", "name"); // <-- add this

//     res.json(ticket);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update ticket" });
//   }
// });

router.put("/:id", authMiddleware, async (req: any, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const logs: any[] = [];

    // STATUS CHANGE
    // if (req.body.status && req.body.status !== ticket.status) {
    //   logs.push({
    //     action: "STATUS_CHANGED",
    //     field: "status",
    //     oldValue: ticket.status,
    //     newValue: req.body.status,
    //     performedBy: req.user.id,
    //   });
    //   ticket.status = req.body.status;
    // }
    if (req.body.status && req.body.status !== ticket.status) {
      logs.push({
        action: "STATUS_CHANGED",
        field: "status",
        oldValue: ticket.status,
        newValue: req.body.status,
        performedBy: req.user.id,
      });

      // 🔔 Notification to assigned agent
      if (ticket.assignedTo) {
        await createNotification(
          ticket.assignedTo.toString(),
          ticket._id.toString(),
          "status_changed",
          `Ticket status changed to ${req.body.status}`
        );
      }

      ticket.status = req.body.status;
    }


    // PRIORITY CHANGE
    // if (req.body.priority && req.body.priority !== ticket.priority) {
    //   logs.push({
    //     action: "PRIORITY_CHANGED",
    //     field: "priority",
    //     oldValue: ticket.priority,
    //     newValue: req.body.priority,
    //     performedBy: req.user.id,
    //   });
    //   ticket.priority = req.body.priority;
    // }
    if (req.body.priority && req.body.priority !== ticket.priority) {
      logs.push({
        action: "PRIORITY_CHANGED",
        field: "priority",
        oldValue: ticket.priority,
        newValue: req.body.priority,
        performedBy: req.user.id,
      });

      if (ticket.assignedTo) {
        await createNotification(
          ticket.assignedTo.toString(),
          ticket._id.toString(),
          "priority_changed",
          `Ticket priority changed to ${req.body.priority}`
        );
      }

      ticket.priority = req.body.priority;
    }


    // ASSIGNMENT CHANGE (Admin only)
    // if (
    //   req.body.assignedTo &&
    //   req.body.assignedTo.toString() !== ticket.assignedTo?.toString()
    // ) {
    //   if (req.user.role !== "admin") {
    //     return res.status(403).json({ error: "Only admin can reassign tickets" });
    //   }

    //   const newAgent = await User.findById(req.body.assignedTo);

    //   const prevAgent = ticket.assignedTo
    //     ? await User.findById(ticket.assignedTo)
    //     : null;

    //   logs.push({
    //     action: "ASSIGNED",
    //     field: "assignedTo",
    //     oldValue: prevAgent?.name || "Unassigned",
    //     newValue: newAgent?.name || "Unknown",
    //     performedBy: req.user.id,
    //   });

    //   ticket.assignedTo = req.body.assignedTo;
    // }
    if (
      req.body.assignedTo &&
      req.body.assignedTo.toString() !== ticket.assignedTo?.toString()
    ) {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Only admin can reassign tickets" });
      }

      const prevAgentId = ticket.assignedTo;
      ticket.assignedTo = req.body.assignedTo;

      logs.push({
        action: prevAgentId ? "REASSIGNED" : "ASSIGNED",
        field: "assignedTo",
        oldValue: prevAgentId?.toString() || "Unassigned",
        newValue: req.body.assignedTo,
        performedBy: req.user.id,
      });

      // 🔔 Notification to new agent
      await createNotification(
        req.body.assignedTo.toString(),
        ticket._id.toString(),
        prevAgentId ? "reassigned" : "assigned",
        prevAgentId
          ? "You have been reassigned a ticket"
          : "A ticket has been assigned to you"
      );
    }



    // OTHER FIELDS (title, description)
    if (req.body.title) ticket.title = req.body.title;
    if (req.body.description) ticket.description = req.body.description;

    // PUSH ACTIVITY LOGS
    if (logs.length > 0) {
      ticket.activityLogs.push(...logs);
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("userId", "name")
      .populate("assignedTo", "name")
      .populate("activityLogs.performedBy", "name role");

    res.json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update ticket" });
  }
});


// UPDATE ticket  -> REASSIGNMENT
router.put(
  "/:id/assign",
  authMiddleware,
  async (req: Request & { user?: any }, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID required" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: agentId },
      { new: true }
    ).populate("assignedTo", "name");
    res.json(ticket);
  }
);


// DELETE ticket (Admin only)
router.delete("/:id", authMiddleware, async (req: Request & { user?: any }, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

export default router;
