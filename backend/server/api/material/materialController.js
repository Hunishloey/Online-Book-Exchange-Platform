const Material = require('./materialModel');
const { uploadImg } = require('../../utilities/helper.js');
const mongoose = require('mongoose');
const { sendError } = require('../../utilities/error.js');

const add = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { title, description, materialTypeId, subjectId, price } = req.body;
        const trimmedTitle = title?.trim();

        // 1. Input Validation
        const errors = {};
        if (!trimmedTitle) errors.title = "Title is required";
        if (!materialTypeId) errors.materialTypeId = "Material type id is required";
        if (!subjectId) errors.subjectId = "Subject id is required";
        if (price && price < 0) errors.price = "Price must be a non-negative number";
        if (!req.files || req.files.length === 0) {
            errors.attachments = "At least one attachment is required";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // 2. Check for Existing Material (case-insensitive + same subject)
        const existingMaterial = await Material.findOne({
            title: {
                $regex: new RegExp(`^${trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
            },
            subjectId
        });

        if (existingMaterial) {
            return res.status(409).json({
                success: false,
                message: "Material with this title already exists for the subject",
                existingMaterial
            });
        }

        // 3. Upload Multiple Files
        const uploadedAttachments = [];
        for (const file of req.files) {
            try {
                const fileUrl = await uploadImg(
                    file.buffer,
                    `materials/attachments/${Date.now()}_${file.originalname}`
                );
                uploadedAttachments.push({
                    url: fileUrl,
                    originalName: file.originalname,
                    fileType: file.mimetype,
                    size: file.size
                });
            } catch (uploadError) {
                console.error("File upload failed:", uploadError);
                // Continue with other files
            }
        }

        if (uploadedAttachments.length === 0) {
            return sendError(res, 500, "Failed to upload any attachments");
        }

        // 4. Save Material
        const count = await Material.countDocuments();
        const newMaterial = new Material({
            autoId: count + 1,
            title: trimmedTitle,
            description: description?.trim(),
            materialTypeId,
            subjectId,
            price: price || 0,
            addedById: req.user,
            attachements: uploadedAttachments,
            status: true
        });

        const savedMaterial = await newMaterial.save();

        return res.status(201).json({
            success: true,
            message: "Material created successfully",
            data: savedMaterial
        });

    } catch (err) {
        if (err.message.includes("Cloudinary")) {
            return sendError(res, 500, "File upload failed");
        }
        return sendError(res, 500, "Failed to add material");
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
        const allowedFilters = ['title', 'materialTypeId', 'subjectId', 'status', 'addedById'];
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

        // Execute both queries in parallel
        const [materials, total] = await Promise.all([
            Material.find(safeFilters)
                .populate('materialTypeId')
                .populate('subjectId')
                .populate('addedById')
                .sort({ createdAt: -1 })  // Add meaningful sort
                .skip(skip)
                .limit(perPage),
            Material.countDocuments(safeFilters)
        ]);

        // Calculate total pages
        const totalPages = Math.ceil(total / perPage);

        // Handle no results for requested page
        if (materials.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`,
                totalDocuments: total,
                totalPages,
                currentPage: page,
                data:[]
            });
        }

        return res.status(200).json({
            success: true,
            message: "Materials fetched successfully",
            note: "Default values: pageno=1 & limit=9",
            currentPage: page,
            totalPages,
            totalDocuments: total,
            itemsPerPage: perPage,
            data: materials
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch materials");
    }
};

const getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const material = await Material.findById(id)
            .populate('materialTypeId')
            .populate('subjectId')
            .populate('addedById');

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Material fetched successfully",
            data: material
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch material");
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        // Find material
        const material = await Material.findById(id);
        if (!material) return sendError(res, 404, "Material not found");

        // Prepare updates
        const allowedUpdates = ['title', 'description', 'materialTypeId', 'subjectId', 'price'];
        const updatedFields = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                acc[key] = key === 'title' || key === 'description' ?
                    updates[key].trim() : updates[key];
            }
            return acc;
        }, {});

        // Handle title uniqueness if changed
        if (updatedFields.title && updatedFields.title !== material.title) {
            const existingMaterial = await Material.findOne({
                title: { $regex: new RegExp(`^${updatedFields.title}$`, 'i') },
                subjectId: updatedFields.subjectId || material.subjectId,
                _id: { $ne: id }
            });

            if (existingMaterial) {
                return sendError(res, 409, "Material with this title already exists for the subject");
            }
        }

        // Handle file uploads if new files are provided
        if (req.files && req.files.length > 0) {
            const newAttachments = [];
            for (const file of req.files) {
                try {
                    const fileUrl = await uploadImg(
                        file.buffer,
                        `materials/attachments/${Date.now()}_${file.originalname}`
                    );
                    newAttachments.push({
                        url: fileUrl,
                        originalName: file.originalname,
                        fileType: file.mimetype,
                        size: file.size
                    });
                } catch (uploadError) {
                    console.error("File upload failed:", uploadError);
                }
            }
            if (newAttachments.length > 0) {
                updatedFields.attachments = [...material.attachments, ...newAttachments];
            }
        }

        // Apply updates
        Object.assign(material, updatedFields);
        await material.save();

        // Populate before response
        const populatedMaterial = await Material.findById(material._id)
            .populate('materialTypeId')
            .populate('subjectId')
            .populate('addedById');

        return res.status(200).json({
            success: true,
            message: "Material updated successfully",
            data: populatedMaterial
        });
    } catch (err) {
        if (err.message.includes("Cloudinary")) {
            return sendError(res, 500, "File upload failed");
        }
        return sendError(res, 500, "Failed to update material");
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const material = await Material.findByIdAndDelete(id)
            .populate('materialTypeId')
            .populate('subjectId')
            .populate('addedById');

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Material deleted successfully",
            data: material
        });
    } catch (err) {
        return sendError(res, 500, "Failed to delete material");
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

        const material = await Material.findById(id);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found"
            });
        }

        material.status = status;
        await material.save();

        return res.status(200).json({
            success: true,
            message: "Material status updated successfully",
            data: material
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update material status");
    }
};

const pagination = async (req, res) => {
    try {
        const { pageno = 1, limit = 10 } = req.body || {};
        const skip = (pageno - 1) * limit;

        const [materials, total] = await Promise.all([
            Material.find()
                .populate('materialTypeId')
                .populate('subjectId')
                .populate('addedById')
                .skip(skip)
                .limit(limit),
            Material.countDocuments()
        ]);

        if (materials.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Materials fetched successfully",
            note: "Default values: pageno=1 & limit=10",
            currentPage: parseInt(pageno),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total,
            data: materials
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch materials");
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