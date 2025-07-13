const mongoose = require('mongoose');
const userSchema= new mongoose.Schema({
    autoId:{type:Number,default:0},
    name:{type:String,default:""},
    email:{type:String,default:""},
    password:{type:String,default:""},
    studentId:{type:mongoose.Schema.Types.ObjectId,ref:"students"},
    userType:{type:Number},
    status:{type:Boolean,default:true}
}, {timestamps:true}
)
module.exports=mongoose.model("users",userSchema);