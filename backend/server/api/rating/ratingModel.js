const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
    autoId: { type: Number, default: 0 },
    addedById: { type: String },
    description: { type: String ,default:""},
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'materials' },
    flashcardId: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    status: { type: Boolean, default: true }, // true for active, false for inactive
    rating: { type: Number }, // 1-5
},{ timestamps: true });

module.exports = mongoose.model("ratings", ratingSchema);