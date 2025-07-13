const Request = require("./requestModel"); // Import your request model
const mongoose = require("mongoose");

const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds (set manually here)

const add = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is required"
            });
        }

        const { requirement } = req.body;
        // 1. Input Validation
        const errors = {};
        if (!requirement) errors.requirement = "Requirement is required";

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        const isAlreadyExists = await Request.findOne({ requirement:{$regex: new RegExp(`^${requirement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
 } });
        if (isAlreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Request already exists",
                data: isAlreadyExists
            });
        }
        // 2. Count existing requests for autoId
        const count = await Request.countDocuments();

        // 3. Create and save request
        const newRequest = new Request({
            requirement: requirement || "nothing", // Default to "nothing" if not provided
            addedById: req.user,
            autoId: count + 1
        });

        const savedRequest = await newRequest.save();

        // 4. Schedule automatic deletion
        setTimeout(async () => {
            try {
                await Request.findByIdAndDelete(savedRequest._id);
            } catch (err) {
                console.error(`Error deleting request ${savedRequest._id}:`, err);
            }
        }, EXPIRATION_TIME);

        return res.status(201).json({
            success: true,
            message: "Request created successfully",
            data: savedRequest,
            expiresIn: EXPIRATION_TIME
        });

    } catch (err) {
        console.error("Error in add request:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};

const getAll = async (req, res) => {
    try {
        // Safely extract filters
        const filters = { ...req.body };
        const allowedFilters = ['requirement','addedById'];
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

        const playlists = await Request.find(safeFilters).populate("addedById")

        const total = await Request.countDocuments(safeFilters);

        return res.status(200).json({
            success: true,
            message: "Requests fetched successfully",
            total,
            data: playlists
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch playlists");
    }
};

module.exports = { add,getAll };