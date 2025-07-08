// const Electricity=require("../model/complain");

// https://hoste-frontend-dusky.vercel.app//
const StudentComplaint = require("../model/complain"); // update to correct path

exports.register_complain= async (req, res) => {
  try {
    let { comments, regno, url } = req.body;

    // Default value for URL if empty
    if (!url) url = "https://images.unsplash.com/photo-1750930340341-b6b9a4e041b6?q=80&w=1072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    // Validate required fields
    if (!comments || !regno) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all the details.",
      });
    }

    // Check role and regno match
    const role = req.user.role;
    const registerno = req.user.regno;

    if (role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can file electricity complaints.",
      });
    }

    if (registerno !== regno) {
      return res.status(403).json({
        success: false,
        message: "Your registration number does not match the complaint.",
      });
    }

    // Check if this student already has a complaint document
    const existingEntry = await StudentComplaint.findOne({
      student_id: req.user._id,
    });

    if (existingEntry) {
      // Push new complaint into the array
      const updatedEntry = await StudentComplaint.findOneAndUpdate(
        { student_id: req.user._id },
        {
          $push: {
            complaints: {
              type: "electricity",
              comments: comments,
              url: url,
              status: false,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Electricity complaint added successfully.",
        data: updatedEntry,
      });
    } else {
      // Create a new document with first complaint
      const newEntry = new StudentComplaint({
        regno: regno,
        roomno: req.user.roomno,
        student_id: req.user._id,
        complaints: [
          {
            type: "electricity",
            comments: comments,
            url: url,
            status: false,
            createdAt: new Date(),
          },
        ],
      });

      const savedEntry = await newEntry.save();

      return res.status(200).json({
        success: true,
        message: "New complaint record created successfully.",
        data: savedEntry,
      });
    }
  } catch (e) {
    console.error("Error while submitting complaint:", e.message);
    res.status(500).json({
      success: false,
      message: "Server error while handling complaint.",
      error: e.message,
    });
  }
};

















































































/*
exports.electric = async (req, res) => {
    try {
        let { comments, regno,url} = req.body;
         
        // Validate input
        if(url == "")url="htttp"
        if (!comments || !regno) {
    return res.status(444).json({ 
        success: false, 
        message: "Please fill in all the details." 
    });
}

// Verify the role
let role = req.user.role;
let registerno = req.user.regno;

if (role !== "student") {
    return res.status(444).json({ 
        success: false, 
        message: "Role of the user does not match electricity complaint." 
    });
}

if (registerno !== regno) {
    return res.status(444).json({ 
        success: false, 
        message: "Register no is not same electricity complaint." 
    });
}

        // Check if a document with the given student_id already exists
        const existingEntry = await Electricity.findOne({ "electrict.student_id": req.user });

        if (existingEntry) {
            // Push data to the `electrict` array
            const updatedEntry = await Electricity.findOneAndUpdate(
                { "electrict.student_id": req.user },
                {
                    $push: {
                        electrict: {
                            comments: comments,
                            regno: regno,
                            roomno: req.user.roomno,
                            url:url,
                            student_id: req.user
                        }
                    }
                },
                { new: true } // Return the updated document
            );

            return res.status(200).json({
                success: true,
                message: "Data added to existing student entry successfully.",
                data: updatedEntry
            });
        } else {
            // Create a new document
            const electricityEntry = new Electricity({
                electrict: [{
                    comments: comments,
                            regno: regno,
                            roomno: req.user.roomno,
                            url:url,
                            student_id: req.user
                }]
            });

            const newEntry = await electricityEntry.save();

            return res.status(200).json({
                success: true,
                message: "New entry created successfully.",
                data: newEntry
            });
        }
    } catch (e) {
        console.error("Error while entering the data in electricity:", e.message);
        res.status(500).json({
            success: false,
            error: "Something went wrong while entering in the electricity section.",
            message: e.message
        });
    }
};
*/

// .................................................................................................... for Internet
