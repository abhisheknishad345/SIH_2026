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

const login = async (req, res) => {
    try {

        validateLoginData(req.body);

        const result = await authService.login(req.body);

        res.status(200).json(result);

    } catch (error) {

        res.status(401).json({
            message: error.message
        });
    }
};

module.exports = {
    signup, verifyEmail, login
};