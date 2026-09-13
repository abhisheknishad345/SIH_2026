const adminSetupMiddleware = (req, res, next) => {
    const setupKey = req.headers["x-admin-setup-key"];

    if (!setupKey) {
        return res.status(401).json({
            message: "Admin setup key is required"
        });
    }

    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
        return res.status(403).json({
            message: "Invalid admin setup key"
        });
    }

    next();
};

module.exports = adminSetupMiddleware;