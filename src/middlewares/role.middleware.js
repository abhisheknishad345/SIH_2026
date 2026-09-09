

const roleMiddleware = (allowedRoles) => {
    
    return (req, res, next) => {
    // console.log("BODY ROLE:", req.body?.role);
    // console.log("JWT ROLE:", req.user?.role);

        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = roleMiddleware;