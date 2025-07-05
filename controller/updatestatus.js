const StudentComplaint = require("../model/complain");
const details=require("../model/detail")
exports.updateStatus = async (req, res) => {
  try {
    const { complainId, elementId } = req.params;

    // ✅ 1. Only admin can update status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admin can update complaint status.",
      });
    }

    // ✅ 2. Find the student complaint document
    const document = await StudentComplaint.findById(complainId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Complaint document not found.",
      });
    }

    // ✅ 3. Find the complaint entry inside the array
    const element = document.complaints.id(elementId);
    if (!element) {
      return res.status(404).json({
        success: false,
        message: "Complaint entry not found.",
      });
    }

    // ✅ 4. Ensure the complaint is of type 'electricity' (optional check)
    // if (element.type !== "electricity") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This is not an electricity complaint.",
    //   });
    // }

    // ✅ 5. Update status to true
    element.status = true;
    await document.save();

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully.",
      data: element,
    });

  } catch (error) {
    console.error("Error updating complaint status:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating complaint status.",
      error: error.message,
    });
  }
};


exports.getStudentComplaintStatus = async (req, res) => {
  try {
    const studentId = req.user._id;
    console.log("printing id ",studentId)

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "User ID (_id) is missing from user data.",
      });
    }

    // Find the complaint document using the student's _id
    const student = await StudentComplaint.findOne({ student_id: studentId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Complaint record for student not found.",
      });
    }

    const complaints = student.complaints || [];

    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === true).length;
    const pending = complaints.filter(c => c.status === false).length;

    return res.status(200).json({
      success: true,
      message: "Complaint stats fetched successfully.",
      data: {
        total,
        resolved,
        pending,
      },
    });

  } catch (error) {
    console.error("Error in fetching complaint stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching complaint stats.",
      error: error.message,
    });
  }
};




exports.getAllComplaintStatsForAdmin = async (req, res) => {
  try {
    // Only allow if admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Fetch all complaint documents
    const allComplaints = await StudentComplaint.find();

    let total = 0;
    let resolved = 0;
    let pending = 0;

    // Go through each student's complaints
    for (const record of allComplaints) {
      const complaints = record.complaints || [];

      total += complaints.length;
      resolved += complaints.filter(c => c.status === true).length;
      pending += complaints.filter(c => c.status === false).length;
    }

    return res.status(200).json({
      success: true,
      message: "Global complaint stats fetched successfully.",
      data: {
        total,
        resolved,
        pending
      }
    });

  } catch (error) {
    console.error("Error in fetching global complaint stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching complaint stats.",
      error: error.message,
    });
  }
};




exports.getAllStudentDetails= async (req, res) => {
  try {
    // Optional: ensure only admin can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }

    const students = await details.find({ role: 'student' }).select('-password'); // exclude password

    res.status(200).json({
      success: true,
      message: 'Students fetched successfully.',
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching students.',
      error: error.message
    });
  }
};


exports.deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // ✅ Only admin allowed
    console.log("del fro student ",studentId)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete students',
      });
    }

    // ✅ Find and delete the student
    const deletedStudent = await details.findOneAndDelete({
      _id: studentId,
      role: 'student'
    });

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student account deleted successfully',
      data: deletedStudent,
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting student',
      error: error.message,
    });
  }
};
