const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    autoId: { type: Number, default: 0 },
    name: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    contact: { type: String, default: "" },
    address:{type:String,default:""},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },  // Fixed this line
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "courses" },
    semester:{type:String,default:""},
    universityRollNo:{type:String,default:""},
    status: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("students", studentSchema);