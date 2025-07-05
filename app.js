const express=require("express");
const app=express();
const cors = require('cors');

app.use(express.json());

require("dotenv").config();
const port=process.env.PORT||8000;

const x=require("./congig/db");
x();


// Enable CORS
app.use(cors());
// /

const r=require("./Route/route");
app.use("/route",r);


app.listen(port,()=>{
    console.log("app is listening ",port);
})


app.get("/" ,(req,res) =>{
    res.send(`<h1> This is HOMEPAGE hostel magment </h1>`);
})
