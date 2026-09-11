
const authService = require("../services/auth.service");
const {validateSignupData, validateLoginData} = require("../validator/auth.validator");


const signup = async (req, res) => {
    try {
        validateSignupData(req.body);
        const result = await authService.signup(req.body);

        res.status(201).json(result);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};

const verifyEmail = async (req, res) => {
    try {

        const result = await authService.verifyEmail(req.body);

        res.status(200).json(result);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const result = await authService.resendOTP(email);

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {

        validateLoginData(req.body);

        const result = await authService.login(req.body);

        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        delete result.token;

        res.status(200).json(result);

    } catch (error) {

        res.status(401).json({
            message: error.message
        });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Logout failed"
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const result =
            await authService.forgotPassword(email);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const {
            email,
            otp,
            newPassword
        } = req.body;

        const result =
            await authService.resetPassword({
                email,
                otp,
                newPassword
            });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    signup, verifyEmail, login, resendOTP, logout, forgotPassword, resetPassword
};