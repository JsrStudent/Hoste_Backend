
const jwt=require("jsonwebtoken")
require("dotenv").config();
const details=require("../model/detail");
const mongoose=require("mongoose");

// module.exports=async (req,res,next)=>{
//     console.log("you are here ")
//     const {authorization}=req.headers;
//     if(!authorization){
//         console.log("error while autorizarion")
//         return res.status(400).json({
            
//             error:"You must logi in -1 authh wala token missing  "

//         })
    
    
//     }
//         const token=authorization.replace("Bearer ","");
//         console.log("Extracted Token:", token);


//         let userdata;
//         try {
//             userdata = await jwt.verify(token, process.env.JWT_URL);
//         } catch (err) {
//             console.error("JWT Verification Error:", err);
//             return res.status(401).json({
//                 success: false,
//                 message: err.name === 'TokenExpiredError' 
//                     ? "Token has expired" 
//                     : "Invalid token",
//             });
//         }


//             if(!userdata){
//                 console.log(err)
//                 return res.status(401).json({
//                     success: false,
//                     error:err.message,
//                     message: "Something went wrong while verifying token"
//                 })

//             }
//             else{
//                 const {id}=userdata;
//                 // console.log("userdata ",userdata);
//                 details.findById(id).then(e => {
                    
//                     // res.status(200).json({
//                     //     success: true,
//                     // message: "verify user ",
//                     // data:userdata
//                     // })
//                     console.log(e)
//                     console.log("ur are login");
//                     req.user=e;
//                     console.log("displaying data ",req.user)
                
//                     next();
//                 })
// }

// }











// const jwt = require('jsonwebtoken');
// const details = require('../models/details'); // Adjust the path to your model

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        console.error("Error: Authorization header missing");
        return res.status(400).json({
            success: false,
            message: "Authorization token is required",
        });
    }

    const token = authorization.replace("Bearer ", "");
    console.log("Extracted Token:", token);

    let userdata;
    try {
        userdata = await jwt.verify(token, process.env.JWT_URL);
    } catch (err) {
        console.error("JWT Verification Error:", err.name, err.message);
        return res.status(401).json({
            success: false,
            message: err.name === 'TokenExpiredError' 
                ? "Token has expired" 
                : "Invalid token",
        });
    }

    if (!userdata) {
        return res.status(401).json({
            success: false,
            message: "Failed to verify token",
        });
    }

    const { id } = userdata;
    console.log("usre data prin kr ne ja rh hai ",userdata)

    details.findById(id)
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found in Databse",
                });
            }
            req.user = user;

            // console.log(" you ar login\n");/
            console.log("Current user regno:", req.user.regno);

           
            next();
        })
        .catch(err => {
            console.error("Database Error:", err);
            res.status(500).json({
                success: false,
                message: "Database query failed",
            });
        });
};
