const mongoose = require("mongoose");

const studentComplaintSchema = new mongoose.Schema({
  regno: {
    type: String,
    required: true,
  },
  roomno: {
    type: String,
    required: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "details",
    required: true,
  },
  complaints: [
    {
      type: {
        type: String,
        enum: ["electricity", "internet", "room", "other"],
        required: true,
      },
      comments: {
        type: String,
        default: "",
      },
      url: {
        type: String,
      },
      status: {
        type: Boolean,
        default: false, // false = unresolved
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
});

module.exports = mongoose.model("StudentComplaint", studentComplaintSchema);
