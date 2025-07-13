const mongoose = require("mongoose");

const materialTypeSchema = new mongoose.Schema({
    autoId: { type: Number, default: 0 },
    typeName: {type:String ,default:""},
    status: { type: Boolean, default: true },
},{timestamps:true});

module.exports = mongoose.model("materialtypes", materialTypeSchema);