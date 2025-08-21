const details=require("../model/detail");
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const detail = require("../model/detail");
const sendMail = require("./SendMail");
require("dotenv").config()


exports.singup= async(req,res)=>{
   try {
    console.log("you  are herer ");
        const { name, regno, phoneno, email, password, roomno, role } = req.body;

        // Validate role first
        if (!role || !["student", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing role (must be 'student' or 'admin')",
            });
        }

        // Validate required fields based on role
        if (role === "student") {
            if (!name || !regno || !phoneno || !email || !password || !roomno) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill in all student fields",
                });
            }
        } else if (role === "admin") {
            if (!phoneno || !email || !password || !name) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill in all admin fields",
                });
            }
        }

        // Check if email already exists
        const existingUser = await details.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already in use",
            });
        }

        // Hash the password
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "Error in hashing password",
            });
        }

        // Prepare user object
        const newUserData = {
            name,
            phoneno,
            email,
            password: hashedPassword,
            role
        };

        // Add student-only fields if role is student
        if (role === "student") {
           
            newUserData.regno = regno;
            newUserData.roomno = roomno;
        }

        // Save user
        const newUser = await details.create(newUserData);

        return res.status(200).json({
            success: true,
            message: "User created successfully",
            data: newUser
        });

    } 
    catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
    

}



/*
*/
// login function


exports.login=async(req,res)=>{
 try{
    const { email, password, role } = req.body;

    // Check if all required details are provided
    if (!email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required details: email, password, and role."
        });
    }

    // Check if the email is registered
    let user = await details.findOne({ email: email });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "User is not registered."
        });
    }

    // Check if the role matches
    if (user.role !== role) {
        
        return res.status(403).json({
            success: false,
            message: "Role does not match. Access denied."
        });
    }


      const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        if (user.role === 'student') {
            payload.regno = user.regno;
            payload.roomno = user.roomno;
        }

    if(await bcrypt.compare(password,user.password)){
        console.log("match password");
        let token=jwt.sign(payload,process.env.JWT_URL,{
            expiresIn:"2h",
        })
        const {_id,name,regno,email,role,roomno}=user;

        return res.status(200).json({
            success:true,
            token,
            user:{_id,name,email,regno,role,roomno},
            message:"login succesfull"

        })
    }
    else{
        return res.status(400).json({
            error:"password incorect"
        })
    }




 }
 catch(e){
    console.log("reason for error",e);
    return res.status(500).json({
        success:false,
      
        meassage:'Login fail! plse try again',
    })
 }
}


// /get total student 

exports.getTotalStudents = async (req, res) => {
  try {
    // Ensure only admin can access
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    const totalStudents = await detail.countDocuments({ role: "student" });

    res.status(200).json({
      success: true,
      message: "Total students count fetched successfully.",
      data: { totalStudents }
    });
  } catch (err) {
    console.error("Error fetching total students:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student count.",
      error: err.message,
    });
  }
};




// / ..............................................................otp function is implemented from here 
// STEP 1: Request signup -> send OTP (do not save user yet)

// Temporary in-memory store for OTP (email -> {data, otp, expiry})
const tempSignupStore = new Map();

exports.signupRequest = async (req, res) => {
  try {
    const { name, regno, phoneno, email, password, roomno, role } = req.body;

    // Validate role
    if (!role || !["student", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid or missing role" });
    }

    // Validate required fields
    if (role === "student") {
      if (!name || !regno || !phoneno || !email || !password || !roomno) {
        return res.status(400).json({ success: false, message: "Please fill in all student fields" });
      }
    } else if (role === "admin") {
      if (!phoneno || !email || !password || !name) {
        return res.status(400).json({ success: false, message: "Please fill in all admin fields" });
      }
    }

    // Allow only NIT JSR emails
    // if (!email.endsWith("@nitjsr.ac.in")) {
    //   return res.status(400).json({ success: false, message: "Only NIT JSR emails allowed" });
    // }

    // Block if already registered
    const existingUser = await details.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    tempSignupStore.set(email, {
      data: { name, regno, phoneno, email, password, roomno, role },
      otp,
      expires
    });

    // Send OTP mail
    await sendMail(
      email,
      "NIT JSR Hostel App - Email Verification",
      `Your OTP is ${otp}. It is valid for 5 minutes.`
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify."
    });

  } catch (err) {
    console.error("signupRequest error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// STEP 2: Verify OTP -> save user if correct
exports.verifyAndRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const pending = tempSignupStore.get(email);
    if (!pending) {
      return res.status(400).json({ success: false, message: "No signup pending or OTP expired." });
    }

    if (Date.now() > pending.expires) {
      tempSignupStore.delete(email);
      return res.status(400).json({ success: false, message: "OTP expired. Try again." });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(pending.data.password, 10);

    // Create user
    const newUserData = {
      name: pending.data.name,
      phoneno: pending.data.phoneno,
      email: pending.data.email,
      password: hashedPassword,
      role: pending.data.role,
    };

    if (pending.data.role === "student") {
      newUserData.regno = pending.data.regno;
      newUserData.roomno = pending.data.roomno;
    }

    const newUser = await details.create(newUserData);

    // Remove from temp store
    tempSignupStore.delete(email);

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: newUser
    });

  } catch (err) {
    console.error("verifyAndRegister error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
