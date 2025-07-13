const Course = require('./courseModel.js');
const { uploadImg } = require('../../utilities/helper.js');
const mongoose = require("mongoose");
const { sendError } = require('../../utilities/error.js');

const add = async (req, res) => {
    try {
        if (!req.body) {
            return sendError(res, 400, "Request body is required");
        }

        const { courseName } = req.body;
        const trimmedCourseName = courseName?.trim();

        // 1. Input Validation
        const errors = {};
        if (!trimmedCourseName) errors.courseName = "Course name is required";
        if (!req.file) errors.logo = "Logo is required";

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // 2. Check for Existing Course (case-insensitive)
        const existingCourse = await Course.findOne({
            courseName: {
                $regex: new RegExp(`^${trimmedCourseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
            }
        });

        if (existingCourse) {
            return res.status(409).json({
                success: false,
                message: "Course with this name already exists",
                existingCourse
            });
        }

        // 3. Upload Image to Cloudinary
        const imgUrl = await uploadImg(
            req.file.buffer,
            `bookswap/courselogo/${Date.now()}`
        );

        // 4. Save Course
        const count = await Course.countDocuments();
        const newCourse = new Course({
            autoId: count + 1,
            courseName: trimmedCourseName,
            logo: imgUrl
        });

        const savedCourse = await newCourse.save();

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: savedCourse
        });

    } catch (err) {
        if (err.message.includes("Cloudinary")) {
            return sendError(res, 500, "Image upload failed");
        }
        return sendError(res, 500, "Failed to add course");
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
        const allowedFilters = ['courseName', 'status', 'autoId'];
        const safeFilters = Object.keys(filters)
            .filter(key => allowedFilters.includes(key))
            .reduce((obj, key) => {
                if (key === 'courseName' && filters[key]) {
                    obj[key] = { $regex: new RegExp(filters[key], 'i') };
                } else {
                    obj[key] = filters[key];
                }
                return obj;
            }, {});

        // Execute both queries in parallel
        const [courses, total] = await Promise.all([
            Course.find(safeFilters)
                .sort({ createdAt: -1 })  // Add meaningful sort
                .skip(skip)
                .limit(perPage),
            Course.countDocuments(safeFilters)
        ]);

        // Calculate total pages
        const totalPages = Math.ceil(total / perPage);

        // Handle no results for requested page
        if (courses.length === 0) {
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
            message: "Courses fetched successfully",
            note: "Default values: pageno=1 & limit=9",
            currentPage: page,
            totalPages,
            totalDocuments: total,
            itemsPerPage: perPage,
            data: courses
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch courses");
    }
};

const getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "ID is required" : "Invalid ID format");
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course fetched successfully",
            data: course
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch course");
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "ID is required" : "Invalid ID format");
        }

        // Find course
        const course = await Course.findById(id);
        if (!course) return sendError(res, 404, "Course not found");

        // Prepare updates
        const allowedUpdates = ['courseName'];
        const updatedFields = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                if (key === 'courseName') {
                    acc[key] = updates[key].trim();
                } else {
                    acc[key] = updates[key];
                }
            }
            return acc;
        }, {});

        // Handle name uniqueness if changed
        if (updatedFields.courseName && updatedFields.courseName !== course.courseName) {
            const existingCourse = await Course.findOne({
                courseName: { $regex: new RegExp(`^${updatedFields.courseName}$`, 'i') }
            });

            if (existingCourse) {
                return sendError(res, 409, "Course with this name already exists");
            }
        }

        // Handle logo update if provided
        if (req.file) {
            const imgUrl = await uploadImg(
                req.file.buffer,
                `bookswap/courselogo/${Date.now()}`
            );
            course.logo = imgUrl;
        }

        // Apply updates
        Object.assign(course, updatedFields);
        await course.save();

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: course
        });
    } catch (err) {
        if (err.message.includes("Cloudinary")) {
            return sendError(res, 500, "Image upload failed");
        }
        return sendError(res, 500, "Failed to update course");
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "ID is required" : "Invalid ID format");
        }

        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
            data: course
        });
    } catch (err) {
        return sendError(res, 500, "Failed to delete course");
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
            return sendError(res, 400, id === ':id' ? "ID is required" : "Invalid ID format");
        }
        if (status === undefined) {
            return sendError(res, 422, "Status is required");
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        course.status = status;
        await course.save();

        return res.status(200).json({
            success: true,
            message: "Course status updated successfully",
            data: course
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update course status");
    }
};

const pagination = async (req, res) => {
    try {
        const { pageno = 1, limit = 10 } = req.body || {};
        const skip = (pageno - 1) * limit;

        const [courses, total] = await Promise.all([
            Course.find()
                .skip(skip)
                .limit(limit),
            Course.countDocuments()
        ]);

        if (courses.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            note: "Default values: pageno=1 & limit=10",
            currentPage: parseInt(pageno),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total,
            data: courses
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch courses");
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