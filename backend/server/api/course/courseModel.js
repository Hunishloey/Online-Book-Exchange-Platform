const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    autoId: { type: Number, default: 0 },
    courseName: { type: String, default: "" },
    logo:  { type: String },
    status: { type: Boolean, default: true },
}, { timestamps: true }
)

 
module.exports = mongoose.model("courses", courseSchema);


