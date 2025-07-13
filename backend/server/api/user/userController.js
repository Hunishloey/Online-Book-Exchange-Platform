const User = require("./userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secretKey = process.env.JWT_SECRET;

const login = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Pass email and password from body"
            });
        }
        
        const { email, password } = req.body;
        const errMsgs = [];

        // Validation
        if (!email) errMsgs.push("Email is required");
        if (!password) errMsgs.push("Password is required");
        if (errMsgs.length > 0) {
            return res.status(400).json({
                success: false,
                message: errMsgs
            });
        }

        const user = await User.findOne({ email }).select('+password').populate("studentId");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email is incorrect"
            });
        }

        // Account status check
        if (!user.status) {
            return res.status(403).json({
                success: false,
                message: "Your account is blocked"
            });
        }

        // STEP 1: Encrypt the provided plain text password
        const encryptedPassword = jwt.sign(password, secretKey);
        
        // STEP 2: Compare encrypted password with stored hash
        const isMatch = await bcrypt.compare(encryptedPassword, user.password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect"
            });
        }

        // Token generation
        const payload = {
            _id: user._id,
            userType: user.userType,
        };

        const token = jwt.sign(payload, secretKey, {
            expiresIn: '24h',
            algorithm: 'HS256'
        });

        // Response without sensitive data
        res.status(200).json({
            success: true,
            message: "Login successful!",
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                studentId: user.studentId || null,
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
const changePassword = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Pass oldPassword, newPassword, confirmPassword from body"
            });
        }

        const { oldPassword, newPassword, confirmPassword } = req.body;
        const errMsgs = [];

        // Validation
        if (!oldPassword) errMsgs.push("Old password is required");
        if (!newPassword) errMsgs.push("New password is required");
        if (!confirmPassword) errMsgs.push("Confirm password is required");

        if (errMsgs.length > 0) {
            return res.status(400).json({
                success: false,
                message: errMsgs
            });
        }

        // Check password match
        if (newPassword !== confirmPassword) {
            return res.status(422).json({
                success: false,
                message: "New password and confirm password do not match"
            });
        }

        const user = await User.findById(req.body._id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Encrypt the input old password with JWT before comparing
        const encryptedOldPassword = jwt.sign(oldPassword, secretKey);

        // Verify current password
        const isMatch = await bcrypt.compare(encryptedOldPassword, user.password);
        if (!isMatch) {
            return res.status(403).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Check new password different
        if (oldPassword === newPassword) {
            return res.status(422).json({
                success: false,
                message: "New password must be different from old password"
            });
        }

        // Encrypt new password with JWT before hashing
        const encryptedNewPassword = jwt.sign(newPassword, secretKey);

        // Hash and save new password
        const saltRounds = 10;
        user.password = await bcrypt.hash(encryptedNewPassword, saltRounds);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
            user: user
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    login,
    changePassword
};