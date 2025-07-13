const Student = require('./studentModel.js');
const User = require('../user/userModel.js');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { uploadImg } = require('../../utilities/helper.js');
const { sendError } = require('../../utilities/error.js');
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

const add = async (req, res) => {
    console.log(secretKey)
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is required"
            });
        }

        const {
            name, contact, address, courseId,
            semester, universityRollNo, email, 
            password, confirmPassword
        } = req.body;

        // Input validation
        const errors = {};
        if (!name?.trim()) errors.name = "Name is required";
        if (!contact) errors.contact = "Contact is required";
        if (!address) errors.address = "Address is required";
        if (!courseId) errors.courseId = "Course ID is required";
        if (!semester) errors.semester = "Semester is required";
        if (!universityRollNo) errors.universityRollNo = "University roll number is required";
        if (!email) errors.email = "Email is required";
        if (!password) errors.password = "Password is required";
        if (!req.file) errors.profileImage = "Profile image is required";

        // Password validation
        if (password && confirmPassword && password !== confirmPassword) {
            errors.passwordMatch = "Password and confirm password do not match";
        }

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Encrypt password with JWT secret key before hashing
        const encryptedPassword = jwt.sign(password, secretKey);
        
        // Process in parallel
        const [imgUrl, passwordHash, count] = await Promise.all([
            uploadImg(req.file.buffer, `bookswap/profileImage/${Date.now()}`),
            bcrypt.hash(encryptedPassword, 10), // Hash the encrypted password
            User.countDocuments()
        ]);

        // Create user
        const newUser = new User({
            autoId: count + 1,
            name: name.trim(),
            email,
            password: passwordHash,
            userType: 2
        });

        const savedUser = await newUser.save();

        // Create student
        const newStudent = new Student({
            autoId: count + 1,
            name: name.trim(),
            contact,
            address,
            courseId,
            semester,
            universityRollNo,
            profileImage: imgUrl,
            userId: savedUser._id
        });

        const savedStudent = await newStudent.save();

        savedUser.studentId = savedStudent._id;
        await savedUser.save();

        return res.status(201).json({
            success: true,
            message: "Student added successfully",
            data: savedStudent
        });

    } catch (err) {
        console.error("Add Student Error:", err);
        if (err.message.includes("Cloudinary")) {
            return res.status(500).json({
                success: false,
                message: "Image upload failed"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to add student"
        });
    }
};
const getAll = async (req, res) => {    
    try {
        // Extract pagination parameters with defaults
        const { pageno = 1, limit = 9, ...filters } = req.body ||{};
        
        // Convert to numbers and validate
        const page = Math.max(1, parseInt(pageno)) || 1;
        const perPage = Math.max(1, parseInt(limit)) || 9;
        const skip = (page - 1) * perPage;

        // Safely extract filters
        const allowedFilters = ['name', 'contact', 'address', 'userId', 'courseId',
            'semester', 'universityRollNo', 'status', 'autoId','_id'];

        const safeFilters = Object.keys(filters)
            .filter(key => allowedFilters.includes(key))
            .reduce((obj, key) => {
                if (key === 'name' && filters[key]) {
                    obj[key] = { $regex: new RegExp(filters[key], 'i') };
                } else {
                    obj[key] = filters[key];
                }
                return obj;
            }, {});

        // Execute both queries in parallel
        const [students, total] = await Promise.all([
            Student.find(safeFilters)
                .populate('courseId')
                .populate('userId')
                .sort({ createdAt: -1 }) // Add meaningful sort
                .skip(skip)
                .limit(perPage),
            Student.countDocuments(safeFilters)
        ]);

        // Calculate total pages
        const totalPages = Math.ceil(total / perPage);

        // Handle no results for requested page
        if (students.length === 0) {
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
            message: "Students fetched successfully",
            note: "Default values: pageno=1 & limit=9",
            currentPage: page,
            totalPages,
            totalDocuments: total,
            itemsPerPage: perPage,
            data: students
        });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, "Failed to fetch students");
    }
};

const getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const student = await Student.findById(id)
            .populate('courseId')
            .populate('userId');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student fetched successfully",
            data: student
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch student");
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        // Find student and user
        const student = await Student.findById(id);
        if (!student) {
            return sendError(res, 404, "Student not found");
        }

        const user = await User.findById(student.userId);
        if (!user) {
            return sendError(res, 404, "User not found");
        }

        // Check for email uniqueness if email is being updated
        if (updates.email && updates.email !== user.email) {
            const existingUser = await User.findOne({ email: updates.email });
            if (existingUser) {
                return sendError(res, 409, "Email already exists");
            }
        }

        // Handle image upload if provided
        if (req.file) {
            const imgUrl = await uploadImg(
                req.file.buffer,
                `bookswap/studentprofile/${Date.now()}`
            );
            student.profileImage = imgUrl;
        }

        // Prepare updates
        const allowedUpdates = ['name', 'contact', 'address', 'courseId',
            'semester', 'universityRollNo', 'email'];
        const updatedFields = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                if (key === 'name') {
                    acc[key] = updates[key].trim();
                } else {
                    acc[key] = updates[key];
                }
            }
            return acc;
        }, {});

        // Apply updates to both student and user
        Object.assign(student, updatedFields);
        
        // Update user fields
        if (updatedFields.name) user.name = updatedFields.name;
        if (updatedFields.email) user.email = updatedFields.email;

        await Promise.all([student.save(), user.save()]);

        return res.status(200).json({
            success: true,
            message: "Student updated successfully",
            data: student
        });
    } catch (err) {
        if (err.message.includes("Cloudinary")) {
            return sendError(res, 500, "Image upload failed");
        }
        return sendError(res, 500, "Failed to update student");
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === ':id' || !mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, id === ':id' ? "id is required" : "Invalid id format");
        }

        const student = await Student.findByIdAndDelete(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        await User.findByIdAndDelete(student.userId);

        return res.status(200).json({
            success: true,
            message: "Student deleted successfully",
            data: student
        });
    } catch (err) {
        return sendError(res, 500, "Failed to delete student");
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

        const student = await Student.findById(id);
        if (!student) {
            return sendError(res, 404, "Student not found");
        }

        const user = await User.findById(student.userId);
        if (!user) {
            return sendError(res, 404, "User not found");
        }

        student.status = status;
        user.status = status;
        await Promise.all([student.save(), user.save()]);

        return res.status(200).json({
            success: true,
            message: "Student status updated successfully",
            data: student
        });
    } catch (err) {
        return sendError(res, 500, "Failed to update student status");
    }
};

const pagination = async (req, res) => {
    try {
        const { pageno = 1, limit = 10 } = req.body || {};
        const skip = (pageno - 1) * limit;

        const [students, total] = await Promise.all([
            Student.find()
                .populate('courseId')
                .populate('userId')
                .skip(skip)
                .limit(limit),
            Student.countDocuments()
        ]);

        if (students.length === 0) {
            return res.status(200).json({
                success: false,
                message: `Total documents are ${total} - provide valid page number`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Students fetched successfully",
            note: "Default values: pageno=1 & limit=10",
            currentPage: parseInt(pageno),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total,
            data: students
        });
    } catch (err) {
        return sendError(res, 500, "Failed to fetch students");
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