const Subject = require("./subjectModel.js");
const { uploadImg } = require("../../utilities/helper.js");
const mongoose = require("mongoose");
const { sendError } = require("../../utilities/error.js");

const add = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { subjectName, courseId, description, status, semester } = req.body;
        const trimmedSubjectName = subjectName?.trim();

        // 1. Input Validation
        const errors = {};
        if (!trimmedSubjectName) errors.subjectName = "Subject name is required";
        if (!courseId) errors.courseId = "Course ID is required";
        if (!semester) errors.semester = "Semester is required";
        if (!req.file) errors.logo = "Logo is required";

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        // 2. Check for Existing Subject (case-insensitive + same course)
        const existingSubject = await Subject.findOne({
            subjectName: {
                $regex: new RegExp(`^${trimmedSubjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
            },
            courseId
        });

        if (existingSubject) {
            return res.status(409).json({
                success: false,
                message: "Subject with this name already exists for the course",
                existingSubject
            });
        }

        // 3. Upload Image to Cloudinary
        const imgUrl = await uploadImg(
            req.file.buffer,
            `swapshelf/subjectlogo/${Date.now()}`
        );

        // 4. Save Subject
        const count = await Subject.countDocuments();
        const newSubject = new Subject({
            subjectName: trimmedSubjectName,
            courseId,
            semester,
            description: description?.trim(),
            status: status !== undefined ? status : true,
            logo: imgUrl,
            autoId: count + 1
        });

        const savedSubject = await newSubject.save();

        return res.status(201).json({
            success: true,
            message: "Subject created successfully",
            data: savedSubject
        });

    } catch (err) {
        console.log(err)
        if (err.message.includes("Cloudinary")) {
            return sendError(res, 500, "Image upload failed");
        }
        return sendError(res, 500, "Failed to add subject");
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
        const allowedFilters = ['subjectName', 'courseId', 'status', 'semester'];
        const safeFilters = Object.keys(filters)
            .filter(key => allowedFilters.includes(key))
            .reduce((obj, key) => {
                if (key === 'subjectName' && filters[key]) {
                    obj[key] = { $regex: new RegExp(filters[key], 'i') };
                } else {
                    obj[key] = filters[key];
                }
                return obj;
            }, {});

        // Execute both queries in parallel
        const [subjects, total] = await Promise.all([
            Subject.find(safeFilters)
                .populate('courseId')
                .sort({ createdAt: -1 })  // Add meaningful sort
                .skip(skip)
                .limit(perPage),
            Subject.countDocuments(safeFilters)
        ]);

        // Calculate total pages
        const totalPages = Math.ceil(total / perPage);

        // Handle no results for requested page
        if (subjects.length === 0) {
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
            message: "Subjects fetched successfully",
            note: "Default values: pageno=1 & limit=9",
            currentPage: page,
            totalPages,
            totalDocuments: total,
            itemsPerPage: perPage,
            data: subjects
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch subjects");
    }
};

const getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const subject = await Subject.findById(id).populate('courseId');
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subject fetched successfully",
            data: subject
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch subject");
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        // Find subject
        const subject = await Subject.findById(id);
        if (!subject) return sendError(res, 404, "Subject not found");

        // Prepare updates
        const allowedUpdates = ['subjectName', 'courseId', 'semester', 'description'];
        const updatedFields = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                if (key === 'subjectName' || key === 'description') {
                    acc[key] = updates[key].trim();
                } else {
                    acc[key] = updates[key];
                }
            }
            return acc;
        }, {});

        // Handle name uniqueness if changed
        if (updatedFields.subjectName && updatedFields.subjectName !== subject.subjectName) {
            const existingSubject = await Subject.findOne({
                subjectName: { $regex: new RegExp(`^${updatedFields.subjectName}$`, 'i') },
                courseId: updatedFields.courseId || subject.courseId
            });

            if (existingSubject) {
                return sendError(res, 409, "Subject with this name already exists for the course");
            }
        }

        // Handle logo update if provided
        if (req.file) {
            const imgUrl = await uploadImg(
                req.file.buffer,
                `swapshelf/subjectlogo/${Date.now()}`
            );
            subject.logo = imgUrl;
        }

        // Apply updates
        Object.assign(subject, updatedFields);
        await subject.save();

        // Populate before response
        const populatedSubject = await Subject.findById(subject._id).populate('courseId');

        return res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            data: populatedSubject
        });
    } catch (err) {
        if (err.message.includes("Cloudinary")) {
            return sendError(res, 500, "Image upload failed");
        }
        return sendError(res, 500, "Failed to update subject");
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const subject = await Subject.findByIdAndDelete(id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subject deleted successfully",
            data: subject
        });
    } catch (err) {
        return sendError(res, 500, "Failed to delete subject");
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

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        subject.status = status;
        await subject.save();

        return res.status(200).json({
            success: true,
            message: "Subject status updated successfully",
            data: subject
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update subject status");
    }
};

const pagination = async (req, res) => {
    try {
        const { pageno = 1, limit = 10 } = req.body || {};
        const skip = (pageno - 1) * limit;

        const [subjects, total] = await Promise.all([
            Subject.find()
                .populate('courseId')
                .skip(skip)
                .limit(limit),
            Subject.countDocuments()
        ]);

        if (subjects.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subjects fetched successfully",
            note: "Default values: pageno=1 & limit=10",
            currentPage: parseInt(pageno),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total,
            data: subjects
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch subjects");
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