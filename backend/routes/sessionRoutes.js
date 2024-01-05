const express = require("express");
const router = express.Router();
const Session = require("../models/Session"); // Import the Session model

function generateSessionId(length = 5) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

router.post("/createSession", async (req, res) => {
  try {
    // Create a new session
    const sessionId = generateSessionId();
    const newSession = new Session({
      name: req.body.name,
      sessionId: sessionId,
      // queueItems: [],
      queue: [],
      courts: [],
    });
    const savedSession = await newSession.save();

    res.status(201).json({ sessionId: savedSession.sessionId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/session/:sessionId", async (req, res) => {
  console.log("Received request for session with ID:", req.params.sessionId);
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (session) {
      res.json({
        name: session.name,
        sessionId: session.sessionId,
        queue: session.queue,
        courts: session.courts,
      });
    } else {
      res.status(404).send("Session not found");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const { emitQueueUpdate } = require("../app");

router.post("/session/:sessionId/queue/update", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const updatedQueue = req.body.queue;

    console.log(`Updating queue for session ${sessionId}:`, updatedQueue);

    const session = await Session.findOne({ sessionId: sessionId });
    if (!session) {
      console.log(`Session not found: ${sessionId}`);
      return res.status(404).send("Session not found");
    }

    console.log(`Current queue:`, session.queue);
    session.queue = updatedQueue;
    await session.save();
    console.log(`Updated queue:`, session.queue);

    req.io.to(sessionId).emit("queueUpdated", updatedQueue);
    // emitQueueUpdate(sessionId, updatedQueue);
    res.status(200).json({ message: "Queue updated successfully" });
  } catch (error) {
    console.error("Error updating queue:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/session/:sessionId/courts/update", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const updatedCourts = req.body.courts;
    const updatedQueue = req.body.queue;

    const session = await Session.findOne({ sessionId: sessionId });
    if (!session) {
      return res.status(404).send("Session not found");
    }

    updatedCourts.forEach((court) => {
      if (court.courtId == null) {
        court.courtId = session.nextCourtId;
        session.nextCourtId += 1;
      }
    });

    session.courts = updatedCourts;
    session.queue = updatedQueue;
    await session.save();

    req.io.to(sessionId).emit("courtsUpdated", updatedCourts);
    console.log(`Updated courts:`, session.courts);
    console.log(`Updated queue:`, session.queue);
    req.io.to(sessionId).emit("queueUpdated", updatedQueue);

    console.log("Response data:", updatedCourts);
    res
      .status(200)
      .json({ courts: updatedCourts, message: "Courts updated successfully" });
  } catch (error) {
    console.error("Error updating courts:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/session/:sessionId/courts/remove", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const updatedCourts = req.body.courts;
    const updatedQueue = req.body.queue;

    const session = await Session.findOne({ sessionId: sessionId });
    if (!session) {
      return res.status(404).send("Session not found");
    }

    session.courts = updatedCourts;
    session.queue = updatedQueue;
    await session.save();

    req.io.to(sessionId).emit("courtsUpdated", updatedCourts);
    req.io.to(sessionId).emit("queueUpdated", updatedQueue);

    res
      .status(200)
      .json({ message: "Players removed from court successfully" });
  } catch (error) {
    console.error("Error removing players from court:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/session/:sessionId/courts/remove/court", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { courtId } = req.body;

    const session = await Session.findOne({ sessionId: sessionId });
    if (!session) {
      return res.status(404).send("Session not found");
    }

    session.courts = session.courts.filter(
      (court) => court.courtId !== courtId
    );
    await session.save();

    req.io.to(sessionId).emit("courtsUpdated", session.courts);

    res.status(200).json({ message: "Court removed successfully" });
  } catch (error) {
    console.error("Error removing court:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
