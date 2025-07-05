const details=require("../model/detail");
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const detail = require("../model/detail");
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
