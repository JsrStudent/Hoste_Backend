const nodemailer = require("nodemailer");

// Create and export a reusable mail function
const sendMail = async (to, subject, text, html = "") => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // ✅ correct Gmail SMTP
      
      secure: true,
      auth: {
        user: "rahull727788@gmail.com", // your email
        pass: "hxnbjbmuisyxnukq",        // your app password
      },
    });

    const info = await transporter.sendMail({
      from: '"Hostel Admin" <rahull727788@gmail.com>',
      to,               // string or array of emails
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendMail;
