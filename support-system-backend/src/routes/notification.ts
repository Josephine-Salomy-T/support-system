import express from "express";
import Ticket from "../models/Ticket";
import User from "../models/User"
import Notification from "../models/Notification";
import type { Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// GET: Fetch logged-in user's notifications
router.get("/", authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20); // latest 20
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// POST: Mark notification as read
router.post("/read/:id", authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// POST: Mark all notifications as read for logged-in user
router.post("/read-all", authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

export default router;
