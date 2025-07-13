const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema({
    autoId: { type: Number, default: 0 },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'subjects'},
    addedById: { type: mongoose.Schema.Types.ObjectId, ref: 'users'}, 
    isPublic: { type: Boolean, default: false },
    title: { type: String, default: "" },
    status: { type: Boolean, default: true } // Added default value
},{timestamps:true}
);

module.exports = mongoose.model("flashcards", flashcardSchema);