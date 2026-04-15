import express from "express";
import Ticket from "../models/Ticket";
import User from "../models/User"
import Notification from "../models/Notification";
import Comment from "../models/Comment";
import type { Request } from "express";
import { authMiddleware } from "../middleware/auth";
import mongoose from "mongoose";
const router = express.Router();

async function createNotification(userId: string, ticketId: string, type: "assigned" | "status_changed" | "priority_changed" | "comment" | "reassigned", message: string) {
  await Notification.create({
    user: userId,
    ticket: ticketId,
    type,
    message,
  });
}

// GET comments for a ticket
router.get("/:id/comments", authMiddleware, async (req: Request & { user?: any }, res) => {
  try {
    const ticketId = req.params.id;
    const comments = await Comment.find({ ticketId })
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST add comment to a ticket
router.post("/:id/comments", authMiddleware, async (req: Request & { user?: any }, res) => {
  try {
    const ticketId = req.params.id;
    const { message, userId, userName, userRole } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const commenterId = (req.user?.id || userId)?.toString();
    const commenterName = (req.user?.name || userName || "User").toString();
    const commenterRole = (req.user?.role || userRole || "employee").toString();

    const comment = await Comment.create({
      ticketId,
      userId: commenterId,
      userName: commenterName,
      userRole: commenterRole,
      message: message.trim(),
    });

    // Notify the other party
    const creatorId = ticket.userId?.toString();
    const assignedAgentId = ticket.assignedTo?.toString();

    // If agent/admin comments -> notify creator
    if (commenterId && creatorId && commenterId !== creatorId && (commenterRole === "agent" || commenterRole === "admin")) {
      const fullTicket = await Ticket.findById(ticketId).populate("userId", "name");
      await createNotification(
        creatorId,
        ticket._id.toString(),
        "comment",
        `Agent replied on ticket #${fullTicket!.ticketNumber} - ${fullTicket!.title}`
      );
    }


    // If creator comments -> notify assigned agent
    if (commenterId && creatorId && commenterId === creatorId && assignedAgentId) {
      const fullTicket = await Ticket.findById(ticketId).populate("userId", "name");
      await createNotification(
        assignedAgentId,
        ticket._id.toString(),
        "comment",
        `Employee replied on ticket #${fullTicket!.ticketNumber} - ${fullTicket!.title}`
      );
    }


    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});



// GET tickets (Admin → all, Agent → own)
router.get("/", authMiddleware, async (req: Request & { user?: any }, res) => {
  try {
    const user = req.user;
    const filter: any = {};
    if (user.role === "employee") {
      filter.userId = user.id;
    } else if (user.role !== "admin") {
      filter.assignedTo = user.id;
    }
    const tickets = await Ticket.find(filter)
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

    if (req.user!.role === "employee") {
      newTicket.status = "Open";
      newTicket.priority = "Medium";
      newTicket.assignedTo = null;
      await newTicket.save();
      
      // Send notification — wrapped so errors don't affect response
      try {
        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
          await Notification.create({
            user: admin._id,
            ticket: newTicket._id,
            type: "new_employee_ticket",
            message: `New ticket raised by ${req.user!.name}: #${newTicket.ticketNumber} - ${newTicket.title}`,
          });
        }
      } catch (notifError) {
        console.log('Notification error (non-fatal):', notifError);
      }
    }


    // Fetch the newly created ticket with populated fields
    const ticket = await Ticket.findById(newTicket._id)
      .populate("userId", "name")
      .populate("assignedTo", "name");

    // 🔔 Notify assigned agent if ticket is assigned
    if (ticket?.assignedTo) {
      const fullTicket = await Ticket.findById(ticket._id).populate("userId", "name");
      await createNotification(
        ticket.assignedTo._id.toString(),
        ticket._id.toString(),
        "assigned",
        `New ticket assigned: #${fullTicket!.ticketNumber} - ${fullTicket!.title}`
      );

    }

    // Always return success
    res.status(201).json(ticket);
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
      const fullTicket = await Ticket.findById(ticket._id).populate("userId", "name");
      await createNotification(
        ticket.assignedTo.toString(),
        ticket._id.toString(),
        "status_changed",
        `Status changed on ticket #${fullTicket!.ticketNumber} - ${fullTicket!.title}`
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
        const fullTicket = await Ticket.findById(ticket._id).populate("userId", "name");
        await createNotification(
          ticket.assignedTo.toString(),
          ticket._id.toString(),
          "priority_changed",
          `Priority changed on ticket #${fullTicket!.ticketNumber} - ${fullTicket!.title}`
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
      const fullTicket = await Ticket.findById(ticket._id).populate("userId", "name");
      await createNotification(
        req.body.assignedTo.toString(),
        ticket._id.toString(),
        prevAgentId ? "reassigned" : "assigned",
        prevAgentId
          ? `Employee replied on ticket #${fullTicket!.ticketNumber} - ${fullTicket!.title}`
          : `New ticket assigned: #${fullTicket!.ticketNumber} - ${fullTicket!.title}`
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
