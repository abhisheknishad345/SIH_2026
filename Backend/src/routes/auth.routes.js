const express = require("express");
const { signup, verifyEmail, login, resendOTP, logout, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");


const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/resend-otp",resendOTP);
router.post("/logout",logout);
router.post("/forgot-password",forgotPassword);

router.post("/reset-password",resetPassword);
router.get("/protected", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "You are authenticated",
        user: req.user
    });
});

router.get(
    "/customer-test",
    authMiddleware,
    roleMiddleware(["customer"]),
    (req, res) => {
        res.json({
            message: "Customer route accessed successfully"
        });
    }
);

router.get(
    "/worker-test",
    authMiddleware,
    roleMiddleware(["worker"]),
    (req, res) => {
        res.json({
            message: "Worker route accessed successfully"
        });
    }
);

module.exports = router;