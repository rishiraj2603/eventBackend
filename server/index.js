require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./src/routes/auth");
const eventRoutes = require("./src/routes/events");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinEventRoom", (eventId) => {
    socket.join(`event:${eventId}`);
    console.log(`Socket ${socket.id} joined event room: ${eventId}`);
  });

  socket.on("leaveEventRoom", (eventId) => {
    socket.leave(`event:${eventId}`);
    console.log(`Socket ${socket.id} left event room: ${eventId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/event-management"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
