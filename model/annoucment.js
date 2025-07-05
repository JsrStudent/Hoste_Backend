const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["electricity", "internet", "other", "college", "sports", "mess"]
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Announcement", announcementSchema);
