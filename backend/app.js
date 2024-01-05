require("dotenv").config();
console.log("MongoDB URI:", process.env.MONGODB_URI);
const express = require("express");
const mongoose = require("mongoose");
const Session = require("./models/Session");
const sessionRoutes = require("./routes/sessionRoutes");
const socketIo = require("socket.io");
const app = express();
const cors = require("cors");
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const emitQueueUpdate = (sessionId, updatedQueue) => {
  io.to(sessionId).emit("queueUpdated", updatedQueue);
};

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinSession", async (sessionId) => {
    socket.join(sessionId);
    try {
      const session = await Session.findOne({ sessionId: sessionId });
      if (session) {
        // Emit the current queue state to the newly connected client
        socket.emit("queueUpdated", session.queue);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  req.io = io;
  next();
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

app.use("/api", sessionRoutes);

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, "../dist")));

// Fallback to serve the index.html file for any other route (SPA behavior)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

const PORT = process.env.PORT || 80;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

module.exports = { app, server, emitQueueUpdate };
