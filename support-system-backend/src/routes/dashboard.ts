import express from "express";
import Ticket from "../models/Ticket";
import User from "../models/User";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();


router.get("/admin", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Global counts
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: "Open" });
    const closedTickets = await Ticket.countDocuments({ status: "Closed" });
    const pendingTickets = await Ticket.countDocuments({ status: "Pending" });

    const recentTickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name")
      .populate("assignedTo", "name")
    const agents = await User.find({ role: "agent"});

    const agentStats = await Promise.all(
      agents.map(async (agent: any) => {
        const tickets = await Ticket.find({
          userId: agent._id,
        });
        console.log("Agent data", agent)
         console.log("Agent name", agent.name)
        //  console.log("Agent name", tickets)

        return {
          id: agent._id,
          name: agent.name,
          total: tickets.length,
          open: tickets.filter(t => t.status === "Open").length,
          closed: tickets.filter(t => t.status === "Closed").length,
          pending: tickets.filter(t => t.status === "Pending").length,
        };
      })
    );

    res.json({
      totalTickets,
      openTickets,
      closedTickets,
      pendingTickets,
      recentTickets,
      agents: agentStats, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard error" });
  }
});


router.get("/agent", authMiddleware, async (req: any, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ message: "Access denied" });
    }

    const myTickets = await Ticket.find({ assignedTo: req.user.id })
  .populate("userId", "name")
  .populate("assignedTo", "name")
  .sort({ createdAt: -1 });

    res.json({
      total: myTickets.length,
      open: myTickets.filter(t => t.status === "Open").length,
      closed: myTickets.filter(t => t.status === "Closed").length,
      tickets: myTickets.slice(0, 5),
    });
  } catch {
    res.status(500).json({ message: "Dashboard error" });
  }
});

export default router;
