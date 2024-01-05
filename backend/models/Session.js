const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  name: String,
  // You can add more fields as needed
  sessionId: String,
  // queueItems
  queue: [
    /* ... */
  ],
  nextCourtId: {
    type: Number,
    default: 1,
  },
  courts: [
    {
      courtId: Number,
      players: Array,
    },
  ],
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
