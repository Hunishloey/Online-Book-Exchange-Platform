const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    autoId: { type: Number, default: 0 },
    requirement: { type: String,default:"nothing" }, // Added requirement field
    addedById: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},//sent request
    created_at: { type: Date, default: Date.now } // Removed parentheses
});

module.exports = mongoose.model("request", requestSchema);