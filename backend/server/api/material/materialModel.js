const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
    autoId: { type: Number, default: 0 },
    title: { type: String },
    description: { type: String, default: "" },
    attachements: [{
        url: { type: String, required: true },  // Changed to object with type
        public_id: { type: String },           // Added this new field
        originalName: { type: String },
        fileType: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date, default: Date.now }
    }],
    price: { type: Number, default: 0 },
    materialTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'materialtypes' },
    addedById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'subjects' },
    status: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("materials", materialSchema);