const Flashcard = require('./flashcardModel');
const mongoose = require('mongoose');
const { sendError } = require('../../utilities/error.js');

const add = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { title, subjectId, isPublic } = req.body;
        const trimmedTitle = title?.trim();

        // 1. Input Validation
        const errors = {};
        if (!trimmedTitle) errors.title = "Title is required";
        if (!subjectId) errors.subjectId = "Subject id is required";

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // 2. Check for Existing Flashcard (case-insensitive + same subject)
        const existingFlashcard = await Flashcard.findOne({
            title: {
                $regex: new RegExp(`^${trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
            },
            subjectId
        });

        if (existingFlashcard) {
            return res.status(409).json({
                success: false,
                message: "Flashcard with this title already exists for the subject",
                existingFlashcard
            });
        }

        const count= await Flashcard.countDocuments();
        // 3. Save Flashcard
        const newFlashcard = new Flashcard({
            autoId: count + 1,
            title: trimmedTitle,
            subjectId,
            isPublic: isPublic || false,
            addedById: req.user
        });

        const savedFlashcard = await newFlashcard.save();

        return res.status(201).json({
            success: true,
            message: "Flashcard created successfully",
            data: savedFlashcard
        });

    } catch (err) {
        return sendError(res, 500, "Failed to add flashcard");
    }
};

const getAll = async (req, res) => {
    try {
        // Safely extract filters
        const filters = { ...req.body };
        const allowedFilters = ['title', 'subjectId', 'isPublic', 'addedById'];
        const safeFilters = Object.keys(filters)
            .filter(key => allowedFilters.includes(key))
            .reduce((obj, key) => {
                if (key === 'title' && filters[key]) {
                    obj[key] = { $regex: new RegExp(filters[key], 'i') };
                } else {
                    obj[key] = filters[key];
                }
                return obj;
            }, {});

        const flashcards = await Flashcard.find(safeFilters)
            .populate('subjectId')
            .populate('addedById');

        const total = await Flashcard.countDocuments(safeFilters);

        return res.status(200).json({
            success: true,
            message: "Flashcards fetched successfully",
            total,
            data: flashcards
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch flashcards");
    }
};

const getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const flashcard = await Flashcard.findById(id)
            .populate('subjectId')
            .populate('addedById');

        if (!flashcard) {
            return res.status(404).json({
                success: false,
                message: "Flashcard not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Flashcard fetched successfully",
            data: flashcard
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch flashcard");
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        // Find flashcard
        const flashcard = await Flashcard.findById(id);
        if (!flashcard) return sendError(res, 404, "Flashcard not found");

        // Prepare updates
        const allowedUpdates = ['title', 'question', 'answer', 'isPublic', 'subjectId'];
        const updatedFields = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                acc[key] = key === 'title' || key === 'question' || key === 'answer' ? 
                    updates[key].trim() : updates[key];
            }
            return acc;
        }, {});

        // Handle title uniqueness if changed
        if (updatedFields.title && updatedFields.title !== flashcard.title) {
            const existingFlashcard = await Flashcard.findOne({
                title: { $regex: new RegExp(`^${updatedFields.title}$`, 'i') },
                subjectId: updatedFields.subjectId || flashcard.subjectId,
                _id: { $ne: id }
            });

            if (existingFlashcard) {
                return sendError(res, 409, "Flashcard with this title already exists for the subject");
            }
        }

        // Apply updates
        Object.assign(flashcard, updatedFields);
        await flashcard.save();

        // Populate before response
        const populatedFlashcard = await Flashcard.findById(flashcard._id)
            .populate('subjectId')
            .populate('addedById');

        return res.status(200).json({
            success: true,
            message: "Flashcard updated successfully",
            data: populatedFlashcard
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update flashcard");
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const flashcard = await Flashcard.findByIdAndDelete(id);
        if (!flashcard) {
            return res.status(404).json({
                success: false,
                message: "Flashcard not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Flashcard deleted successfully",
            data: flashcard
        });
    } catch (err) {
        return sendError(res, 500, "Failed to delete flashcard");
    }
};

const changeStatus = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { id } = req.params;
        const { status } = req.body;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }
        if (status === undefined) {
            return sendError(res, 422, "Status is required");
        }

        const flashcard = await Flashcard.findById(id);
        if (!flashcard) {
            return res.status(404).json({
                success: false,
                message: "Flashcard not found"
            });
        }

        flashcard.status = status;
        await flashcard.save();

        return res.status(200).json({
            success: true,
            message: "Flashcard status updated successfully",
            data: flashcard
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update flashcard status");
    }
};

const changePublicStatus = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { id } = req.params;
        const { isPublic } = req.body;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }
        if (isPublic === undefined) {
            return sendError(res, 422, "isPublic is required");
        }

        const flashcard = await Flashcard.findById(id);
        if (!flashcard) {
            return res.status(404).json({
                success: false,
                message: "Flashcard not found"
            });
        }

        flashcard.isPublic = isPublic;
        await flashcard.save();

        return res.status(200).json({
            success: true,
            message: "Flashcard public status updated successfully",
            data: flashcard
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update flashcard public status");
    }
};

const pagination = async (req, res) => {
    try {
        const { pageno = 1, limit = 10 } = req.body || {};
        const skip = (pageno - 1) * limit;

        const [flashcards, total] = await Promise.all([
            Flashcard.find()
                .populate('subjectId')
                .populate('addedById')
                .skip(skip)
                .limit(limit),
            Flashcard.countDocuments()
        ]);

        if (flashcards.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Flashcards fetched successfully",
            note: "Default values: pageno=1 & limit=10",
            currentPage: parseInt(pageno),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total,
            data: flashcards
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch flashcards");
    }
};

module.exports = {
    add,
    getAll,
    getSingle,
    update,
    deleteOne,
    changeStatus,
    changePublicStatus,
    pagination
};