const StudentComplaint = require("../model/complain");


/*
exports.getStudentComplaints = async (req, res) => {
  try {
    const regno = req.user.regno;
    console.log(regno)

    if (!regno) {
      return res.status(400).json({
        success: false,
        message: "Registration number is missing from user data.",
      });
    }

    // Find all documents that match the student's regno
    const complaints = await StudentComplaint.find({ regno });

    if (!complaints || complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No complaints found for this student.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaints fetched successfully.",
      data: complaints,
    });

  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching complaints.",
      error: err.message,
    });
  }
};
*/
exports.getStudentComplaints = async (req, res) => {
  try {
    const student_id = req.user._id; // This comes from your token / middleware

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is missing from user data.",
      });
    }

    // Find all complaints matching student_id
    const complaints = await StudentComplaint.find({ student_id });

    if (!complaints || complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No complaints found for this student.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaints fetched successfully.",
      data: complaints,
    });

  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching complaints.",
      error: err.message,
    });
  }
};

// controllers/adminController.js or controllers/complaintController.js

// GET: All complaints for admin

exports.getAllComplaintsForAdmin = async (req, res) => {
  try {
    const user = req.user; // Assumes user is added by auth middleware

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    const complaints = await StudentComplaint.find();

    res.status(200).json({
      success: true,
      message: "All complaints fetched successfully.",
      data: complaints,
    });
  } catch (error) {
    console.error("Error fetching all complaints for admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching all complaints.",
      error: error.message,
    });
  }
};
