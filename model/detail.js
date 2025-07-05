const mongoose=require("mongoose")
const {ObjectId}=mongoose.Schema.Types;
/*
const userschema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    regno:{
        type:String,
        require:true,
    },
    
    phoneno:{
        type:Number,
        require:true,
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    roomno:{
         type:String,
        require:true
    },
    role: {
		type: String,
		required: true,
		enum: ['student', 'admin'], // Only allows "student" or "admin"
	}
   
})


*/

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: function () {
            return this.role === 'student';
        }
    },
    regno: {
        type: String,
        required: function () {
            return this.role === 'student';
        }
    },
    phoneno: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roomno: {
        type: String,
        required: function () {
            return this.role === 'student';
        }
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'admin'] // only student or admin allowed
    }
});
module.exports=mongoose.model("detail",userschema);






// Get total registered students - Admin only
