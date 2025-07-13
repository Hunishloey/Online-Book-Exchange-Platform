const mongoose = require("mongoose");

const flashcarditemSchema = new mongoose.Schema({
    autoId: { type: Number, default: 0 },
    flashCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'flashcards'},
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
    status: { type: Boolean, default: true } // Added default value
});

module.exports = mongoose.model("flashcarditems", flashcarditemSchema);
