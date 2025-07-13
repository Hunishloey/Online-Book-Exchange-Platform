const FlashcardItem = require("./flashCardItemModel.js");
const mongoose = require('mongoose');
const { sendError } = require('../../utilities/error.js');

const add = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { flashCardId, question, answer, status } = req.body;
        const trimmedQuestion = question?.trim();
        const trimmedAnswer = answer?.trim();

        // 1. Input Validation
        const errors = {};
        if (!flashCardId) errors.flashCardId = "Flashcard id is required";
        if (!trimmedQuestion) errors.question = "Question is required";
        if (!trimmedAnswer) errors.answer = "Answer is required";

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // 2. Check for Existing Flashcard Item (case-insensitive)
        const existingItem = await FlashcardItem.findOne({
            question: {
                $regex: new RegExp(`^${trimmedQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
            },
            answer: {
                $regex: new RegExp(`^${trimmedAnswer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
            }
        });

        if (existingItem) {
            return res.status(409).json({
                success: false,
                message: "Flashcard item with this question and answer already exists",
                existingItem
            });
        }

        const count = await FlashcardItem.countDocuments();
        // 3. Save Flashcard Item
        const newItem = new FlashcardItem({
            autoId: count + 1,
            flashCardId,
            question: trimmedQuestion,
            answer: trimmedAnswer,
            status: status !== undefined ? status : true
        });

        const savedItem = await newItem.save();

        return res.status(201).json({
            success: true,
            message: "Flashcard item created successfully",
            data: savedItem
        });

    } catch (err) {
        return sendError(res, 500, "Failed to add flashcard item");
    }
};

const getAll = async (req, res) => {
    try {
        // Safely extract filters
        const filters = { ...req.body };
        const allowedFilters = ['flashCardId', 'question', 'answer', 'status'];
        const safeFilters = Object.keys(filters)
            .filter(key => allowedFilters.includes(key))
            .reduce((obj, key) => {
                if ((key === 'question' || key === 'answer') && filters[key]) {
                    obj[key] = { $regex: new RegExp(filters[key], 'i') };
                } else {
                    obj[key] = filters[key];
                }
                return obj;
            }, {});

        const items = await FlashcardItem.find(safeFilters)
            .populate('flashCardId');

        const total = await FlashcardItem.countDocuments(safeFilters);

        return res.status(200).json({
            success: true,
            message: "Flashcard items fetched successfully",
            total,
            data: items
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch flashcard items");
    }
};

const getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const item = await FlashcardItem.findById(id)
            .populate('flashCardId');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Flashcard item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Flashcard item fetched successfully",
            data: item
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch flashcard item");
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        // Find flashcard item
        const item = await FlashcardItem.findById(id);
        if (!item) return sendError(res, 404, "Flashcard item not found");

        // Prepare updates
        const allowedUpdates = ['question', 'answer', 'status'];
        const updatedFields = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                acc[key] = key === 'question' || key === 'answer' ? 
                    updates[key].trim() : updates[key];
            }
            return acc;
        }, {});

        // Handle question/answer uniqueness if changed
        if (updatedFields.question || updatedFields.answer) {
            const existingItem = await FlashcardItem.findOne({
                _id: { $ne: id },
                question: { 
                    $regex: new RegExp(`^${updatedFields.question || item.question}$`, 'i') 
                },
                answer: { 
                    $regex: new RegExp(`^${updatedFields.answer || item.answer}$`, 'i') 
                }
            });

            if (existingItem) {
                return sendError(res, 409, "Flashcard item with this question and answer already exists");
            }
        }

        // Apply updates
        Object.assign(item, updatedFields);
        await item.save();

        // Populate before response
        const populatedItem = await FlashcardItem.findById(item._id)
            .populate('flashCardId');

        return res.status(200).json({
            success: true,
            message: "Flashcard item updated successfully",
            data: populatedItem
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update flashcard item");
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const item = await FlashcardItem.findByIdAndDelete(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Flashcard item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Flashcard item deleted successfully",
            data: item
        });
    } catch (err) {
        return sendError(res, 500, "Failed to delete flashcard item");
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

        const item = await FlashcardItem.findById(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Flashcard item not found"
            });
        }

        item.status = status;
        await item.save();

        return res.status(200).json({
            success: true,
            message: "Flashcard item status updated successfully",
            data: item
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update flashcard item status");
    }
};

const pagination = async (req, res) => {
    try {
        const { pageno = 1, limit = 10 } = req.body || {};
        const skip = (pageno - 1) * limit;

        const [items, total] = await Promise.all([
            FlashcardItem.find()
                .populate('flashCardId')
                .skip(skip)
                .limit(limit),
            FlashcardItem.countDocuments()
        ]);

        if (items.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Flashcard items fetched successfully",
            note: "Default values: pageno=1 & limit=10",
            currentPage: parseInt(pageno),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total,
            data: items
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch flashcard items");
    }
};

module.exports = {
    add,
    getAll,
    getSingle,
    update,
    deleteOne,
    changeStatus,
    pagination
};