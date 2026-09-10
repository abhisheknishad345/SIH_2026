const jwt = require("jsonwebtoken");

const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const parts = authHeader.split(" ");

            if (parts.length !== 2 || parts[0] !== "Bearer") {
                return res.status(401).json({
                    message: "Invalid authorization format"
                });
            }

            token = parts[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        } else {
            return res.status(401).json({
                message: "Authentication token is required"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists"
            });
        }

        if (!user.emailVerified) {
            return res.status(401).json({
                message: "Email is not verified"
            });
        }

        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;