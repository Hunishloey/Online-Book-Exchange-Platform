const mongoose = require("mongoose");

const playListSchema = new mongoose.Schema({
    autoId: { type: Number, default: 0 },
    title: { type: String },
    videoLinks: [{ type: String }],
    addedById: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'subjects' },
    isPublic: { type: Boolean, default: false }, 
    status: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("playlistes", playListSchema);