const express = require("express");
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("creator", "username")
      .populate("attendees", "username")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const event = new Event({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      creator: req.userId,
      attendees: [],
    });

    await event.save();
    await event.populate("creator", "username");

    const io = req.app.get("io");
    io.emit("newEvent", event);

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", {
      error,
      userId: req.userId,
      eventData: req.body,
    });

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      creator: req.userId,
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.title = req.body.title;
    event.description = req.body.description;
    event.location = req.body.location;
    event.startDate = req.body.startDate;
    event.endDate = req.body.endDate;

    await event.save();
    await event.populate("creator", "username");
    await event.populate("attendees", "username");

    const io = req.app.get("io");
    io.to(`event:${event._id}`).emit("eventUpdated", event);

    res.json(event);
  } catch (error) {
    console.error("Error updating event:", {
      error,
      userId: req.userId,
      eventId: req.params.id,
      updateData: req.body,
    });

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      creator: req.userId,
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const io = req.app.get("io");
    io.emit("eventDeleted", req.params.id);

    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting event:", {
      error,
      userId: req.userId,
      eventId: req.params.id,
    });
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/join", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const now = new Date();
    if (now < new Date(event.startDate)) {
      return res.status(400).json({ message: "Event has not started yet" });
    }

    if (now > new Date(event.endDate)) {
      return res.status(400).json({ message: "Event has already ended" });
    }

    if (event.attendees.includes(req.userId)) {
      return res.status(400).json({ message: "Already joined" });
    }

    event.attendees.push(req.userId);
    await event.save();
    await event.populate("creator", "username");
    await event.populate("attendees", "username");

    const joiningUser = await User.findById(req.userId, "username");

    const io = req.app.get("io");
    io.to(`event:${event._id}`).emit("attendeeJoined", {
      event,
      attendeeCount: event.attendees.length,
      joiningUser: joiningUser.username,
    });

    res.json(event);
  } catch (error) {
    console.error("Error joining event:", {
      error,
      userId: req.userId,
      eventId: req.params.id,
    });
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/unjoin", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.attendees.includes(req.userId)) {
      return res.status(400).json({ message: "Not joined yet" });
    }

    const leavingUser = await User.findById(req.userId, "username");

    event.attendees = event.attendees.filter(
      (id) => id.toString() !== req.userId
    );
    await event.save();
    await event.populate("creator", "username");
    await event.populate("attendees", "username");

    const io = req.app.get("io");
    io.to(`event:${event._id}`).emit("attendeeLeft", {
      event,
      attendeeCount: event.attendees.length,
      leavingUser: leavingUser.username,
    });

    res.json(event);
  } catch (error) {
    console.error("Error unjoining event:", {
      error,
      userId: req.userId,
      eventId: req.params.id,
    });
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
