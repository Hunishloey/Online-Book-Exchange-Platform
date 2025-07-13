const Rating = require('./ratingModel');
const mongoose = require('mongoose');
const { sendError } = require('../../utilities/error.js');

const add = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { materialId, flashcardId, rating, description } = req.body;
        
        // 1. Input Validation
        const errors = {};
        if (!rating) errors.rating = "Rating is required";
        if (rating && (rating < 1 || rating > 5)) errors.rating = "Rating must be between 1 and 5";
        if (!materialId && !flashcardId) {
            errors.resource = "Either materialId or flashcardId is required";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // 2. Check for existing rating by same user for same resource
        const existingRating = await Rating.findOne({
            addedById: req.user,
            $or: [
                { materialId: materialId || null },
                { flashcardId: flashcardId || null }
            ]
        });

        if (existingRating) {
            return res.status(409).json({
                success: false,
                message: "User has already rated this resource",
                existingRating
            });
        }

        const count = await Rating.countDocuments();
        // 3. Save Rating
        const newRating = new Rating({
            autoId: count + 1,
            addedById: req.user,
            materialId,
            flashcardId,
            rating,
            description: description || ""
        });

        const savedRating = await newRating.save();

        return res.status(201).json({
            success: true,
            message: "Rating added successfully",
            data: savedRating
        });

    } catch (err) {
        return sendError(res, 500, "Failed to add rating");
    }
};

const getAll = async (req, res) => {
    try {
        // Safely extract filters
        const filters = { ...req.body };
        const allowedFilters = ['addedById', 'materialId', 'flashcardId', 'rating', 'status'];
        const safeFilters = Object.keys(filters)
            .filter(key => allowedFilters.includes(key))
            .reduce((obj, key) => {
                obj[key] = filters[key];
                return obj;
            }, {});

        const ratings = await Rating.find(safeFilters)
            .populate('materialId')
            .populate('flashcardId')
            .populate('addedById');

        const total = await Rating.countDocuments(safeFilters);

        return res.status(200).json({
            success: true,
            message: "Ratings fetched successfully",
            total,
            data: ratings
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch ratings");
    }
};

const getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const rating = await Rating.findById(id)
            .populate('materialId')
            .populate('flashcardId')
            .populate('addedById');

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "Rating not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Rating fetched successfully",
            data: rating
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch rating");
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        // Find rating
        const rating = await Rating.findById(id);
        if (!rating) return sendError(res, 404, "Rating not found");

        // Prepare updates
        const allowedUpdates = ['rating', 'description'];
        const updatedFields = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                if (key === 'rating' && (updates[key] < 1 || updates[key] > 5)) {
                    return sendError(res, 422, "Rating must be between 1 and 5");
                }
                acc[key] = updates[key];
            }
            return acc;
        }, {});

        // Apply updates
        Object.assign(rating, updatedFields);
        await rating.save();

        // Populate before response
        const populatedRating = await Rating.findById(rating._id)
            .populate('materialId')
            .populate('flashcardId')
            .populate('addedById');

        return res.status(200).json({
            success: true,
            message: "Rating updated successfully",
            data: populatedRating
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update rating");
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const rating = await Rating.findByIdAndDelete(id)
            .populate('materialId')
            .populate('flashcardId')
            .populate('addedById');

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "Rating not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Rating deleted successfully",
            data: rating
        });
    } catch (err) {
        return sendError(res, 500, "Failed to delete rating");
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

        const rating = await Rating.findById(id);
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "Rating not found"
            });
        }

        rating.status = status;
        await rating.save();

        return res.status(200).json({
            success: true,
            message: "Rating status updated successfully",
            data: rating
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update rating status");
    }
};

const pagination = async (req, res) => {
    try {
        const { pageno = 1, limit = 10 } = req.body || {};
        const skip = (pageno - 1) * limit;

        const [ratings, total] = await Promise.all([
            Rating.find()
                .populate('materialId')
                .populate('flashcardId')
                .populate('addedById')
                .skip(skip)
                .limit(limit),
            Rating.countDocuments()
        ]);

        if (ratings.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ratings fetched successfully",
            note: "Default values: pageno=1 & limit=10",
            currentPage: parseInt(pageno),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total,
            data: ratings
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch ratings");
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