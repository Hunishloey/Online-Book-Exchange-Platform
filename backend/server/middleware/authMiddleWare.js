const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("authorization");

    if (!token) {
        return res.json({
            status: 401,
            success: false,
            message: "Authorization header missing"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded._id) {
            return res.json({
                status: 400,
                success: false,
                message: "Invalid token !!"
            });
        }
        //
        
        req.user = decoded._id;
        next();
    } catch (error) {
        return res.json({
            status: 401,
            success: false,
            message: "Invalid Token"
        });
    }
};

module.exports = authMiddleware;
