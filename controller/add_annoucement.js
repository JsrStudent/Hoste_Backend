const Announcement = require("../model/annoucment");

exports.addAnnouncement = async (req, res) => {
  try {
    const { type, description } = req.body;

    // Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can add announcements",
      });
    }

    const newAnnouncement = new Announcement({
      type,
      description
    });

    await newAnnouncement.save();

    res.status(201).json({
      success: true,
      message: "Announcement added successfully",
      data: newAnnouncement
    });
  } catch (err) {
    console.error("Add Announcement Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to add announcement",
      error: err.message
    });
  }
};


// controllers/adminController.js (or a separate announcementController.js)



exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });

    return res.status(200).json({
      success: true,
      message: "Announcements fetched successfully.",
      data: announcements
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements.",
      error: error.message
    });
  }
};

