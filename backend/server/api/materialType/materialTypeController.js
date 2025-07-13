const MaterialType = require('./materialTypeModel');
const mongoose = require('mongoose');
const { sendError } = require('../../utilities/error.js');

const add = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { typeName } = req.body;
        const trimmedTypeName = typeName?.trim();

        // 1. Input Validation
        const errors = {};
        if (!trimmedTypeName) errors.typeName = "Type name is required";

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // 2. Check for Existing Material Type (case-insensitive)
        const existingMaterialType = await MaterialType.findOne({
            typeName: {
                $regex: new RegExp(`^${trimmedTypeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
            }
        });

        if (existingMaterialType) {
            return res.status(409).json({
                success: false,
                message: "Material type with this name already exists",
                existingMaterialType
            });
        }

        const count = await MaterialType.countDocuments();
        // 3. Save Material Type
        const newMaterialType = new MaterialType({
            typeName: trimmedTypeName,
            autoId: count + 1
        });

        const savedMaterialType = await newMaterialType.save();

        return res.status(201).json({
            success: true,
            message: "Material type created successfully",
            data: savedMaterialType
        });

    } catch (err) {
        return sendError(res, 500, "Failed to add material type");
    }
};

const getAll = async (req, res) => {
    try {
        // Extract pagination parameters with defaults
        const { pageno = 1, limit = 9, ...filters } = req.body || {};
        
        // Convert to numbers and validate
        const page = Math.max(1, parseInt(pageno)) || 1;
        const perPage = Math.max(1, parseInt(limit)) || 9;
        const skip = (page - 1) * perPage;

        // Safely extract filters
        const allowedFilters = ['typeName', 'status'];
        const safeFilters = Object.keys(filters)
            .filter(key => allowedFilters.includes(key))
            .reduce((obj, key) => {
                if (key === 'typeName' && filters[key]) {
                    obj[key] = { $regex: new RegExp(filters[key], 'i') };
                } else {
                    obj[key] = filters[key];
                }
                return obj;
            }, {});

        // Execute both queries in parallel
        const [materialTypes, total] = await Promise.all([
            MaterialType.find(safeFilters)
                .sort({ createdAt: -1 })  // Sort by newest first
                .skip(skip)
                .limit(perPage),
            MaterialType.countDocuments(safeFilters)
        ]);

        // Calculate total pages
        const totalPages = Math.ceil(total / perPage);

        // Handle no results for requested page
        if (materialTypes.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`,
                totalDocuments: total,
                totalPages,
                currentPage: page
            });
        }

        return res.status(200).json({
            success: true,
            message: "Material types fetched successfully",
            note: "Default values: pageno=1 & limit=9",
            currentPage: page,
            totalPages,
            totalDocuments: total,
            itemsPerPage: perPage,
            data: materialTypes
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch material types");
    }
};

const getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const materialType = await MaterialType.findById(id);
        if (!materialType) {
            return res.status(404).json({
                success: false,
                message: "Material type not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Material type fetched successfully",
            data: materialType
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch material type");
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        // Find material type
        const materialType = await MaterialType.findById(id);
        if (!materialType) return sendError(res, 404, "Material type not found");

        // Prepare updates
        const allowedUpdates = ['typeName', 'status'];
        const updatedFields = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                acc[key] = key === 'typeName' ? updates[key].trim() : updates[key];
            }
            return acc;
        }, {});

        // Handle name uniqueness if changed
        if (updatedFields.typeName && updatedFields.typeName !== materialType.typeName) {
            const existingMaterialType = await MaterialType.findOne({
                typeName: { $regex: new RegExp(`^${updatedFields.typeName}$`, 'i') },
                _id: { $ne: id } // Exclude current material type
            });

            if (existingMaterialType) {
                return sendError(res, 409, "Material type with this name already exists");
            }
        }

        // Apply updates
        Object.assign(materialType, updatedFields);
        await materialType.save();

        return res.status(200).json({
            success: true,
            message: "Material type updated successfully",
            data: materialType
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update material type");
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const materialType = await MaterialType.findByIdAndDelete(id);
        if (!materialType) {
            return res.status(404).json({
                success: false,
                message: "Material type not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Material type deleted successfully",
            data: materialType
        });
    } catch (err) {
        return sendError(res, 500, "Failed to delete material type");
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

        const materialType = await MaterialType.findById(id);
        if (!materialType) {
            return res.status(404).json({
                success: false,
                message: "Material type not found"
            });
        }

        materialType.status = status;
        await materialType.save();

        return res.status(200).json({
            success: true,
            message: "Material type status updated successfully",
            data: materialType
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update material type status");
    }
};

const pagination = async (req, res) => {
    try {
        const { pageno = 1, limit = 10 } = req.body || {};
        const skip = (pageno - 1) * limit;

        const [materialTypes, total] = await Promise.all([
            MaterialType.find()
                .skip(skip)
                .limit(limit),
            MaterialType.countDocuments()
        ]);

        if (materialTypes.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Material types fetched successfully",
            note: "Default values: pageno=1 & limit=10",
            currentPage: parseInt(pageno),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total,
            data: materialTypes
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch material types");
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