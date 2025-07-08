const Announcement = require("../model/annoucment");
const sendMail = require("./SendMail");

const User = require("../model/detail"); // your student/admin model


exports.addAnnouncement = async (req, res) => {
  try {
    const { type, description } = req.body;

    // ✅ Check admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can add announcements",
      });
    }

    // ✅ Save announcement to DB
    const newAnnouncement = new Announcement({
      type,
      description,
    });
    await newAnnouncement.save();

    // ✅ Fetch only students' emails
    const students = await User.find({ role: "student" }, "email name");
    const emails = students.map((student) => student.email);

    // ✅ Email content
    const subject = `Hostel Notification: ${type} Issue`;
    const text = `Dear student, an announcement has been posted regarding ${type} issues. Please visit the hostel portal for full details.`;
    const html = `
      <p>Dear Student,</p>
      <p>This is to inform you that an announcement has been posted by the Hostel Admin regarding <b>${type}</b> issues.</p>
      <p>Please log in to the <a href="https://hoste-frontend-dusky.vercel.app/login" target="_blank">hostel website</a> to view the full details.</p>
      <br>
      <p>Regards,<br>Hostel Admin</p>
    `;

    // ✅ Send mail to all students
    await sendMail(emails, subject, text, html);

    return res.status(201).json({
      success: true,
      message: "Announcement added and email notifications sent",
      data: newAnnouncement,
    });
  } catch (err) {
    console.error("Add Announcement Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to add announcement",
      error: err.message,
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

