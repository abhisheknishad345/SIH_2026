const CooperativeAdmin = require("../models/CooperativeAdmin");

const cooperativeAdminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (req.user.role !== "cooperative_admin") {
            return res.status(403).json({
                message: "Cooperative admin access required"
            });
        }

        const admin = await CooperativeAdmin.findOne({
            userId: req.user._id,
            isActive: true
        });

        if (!admin) {
            return res.status(403).json({
                message: "Cooperative admin profile not found"
            });
        }

        req.cooperativeAdmin = admin;

        next();

    } catch (error) {
        return res.status(500).json({
            message: "Failed to verify cooperative admin"
        });
    }
};

module.exports = cooperativeAdminMiddleware;