const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    autoId: { type: Number, default: 0 },
    subjectName: { type: String },
    logo: { type: String },
    semester:{type:String, default:""},
    status: { type: Boolean, default: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
}, { timestamps: true })

module.exports = new mongoose.model("subjects", subjectSchema);