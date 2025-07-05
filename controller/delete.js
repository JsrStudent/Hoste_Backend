const StudentComplaint = require("../model/complain");

exports.delete_complain = async (req, res) => {
  const { complainId, elementId } = req.params;

  try {
    const loggedInRegno = req.user.regno;

    // Find the document by student complaint ID and specific complaint element
    const document = await StudentComplaint.findOne({
      _id: complainId,
      "complaints._id": elementId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found or element does not exist.",
      });
    }

    // Find the specific complaint item
    const element = document.complaints.find(
      (item) => item._id.toString() === elementId
    );

    if (!element) {
      return res.status(404).json({
        success: false,
        message: "Element does not exist.",
      });
    }

    // Authorization: check if the regno matches
    if (req.user.role !== "admin" && document.regno !== loggedInRegno) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this complaint — regno mismatch.",
      });
    }

    // Optional: if you want to restrict based on status (e.g., only delete if resolved)
    // if (!element.status) {
    //   return res.status(400).json({ message: "Cannot delete unresolved complaint." });
    // }

    // Delete the specific complaint from the array
    const updatedDocument = await StudentComplaint.findOneAndUpdate(
      { _id: complainId },
      { $pull: { complaints: { _id: elementId } } },
      { new: true }
    );

    // If no complaints left, delete the full document
    if (updatedDocument && updatedDocument.complaints.length === 0) {
      await StudentComplaint.deleteOne({ _id: complainId });

      return res.status(200).json({
        success: true,
        message: "Complaint deleted. Document removed as no complaints remained.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully.",
      data: updatedDocument,
    });
  } catch (err) {
    console.error("Error while deleting complaint:", err);
    res.status(500).json({
      success: false,
      message: "Server error while deleting complaint.",
      error: err.message,
    });
  }
};
