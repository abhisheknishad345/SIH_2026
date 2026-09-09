const validator = require("validator");

const validateSignupData = ({ fullName, email, password, role }) => {
    if (!fullName) {
        throw new Error("Full name is required");
    }

    if (fullName.length < 3 || fullName.length > 50) {
        throw new Error("Full name must be between 3-50 characters");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Email is invalid");
    }

    if (!validator.isStrongPassword(password, {
        minLength: 8,
        maxLength: 128,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })) {
        throw new Error(
            "Password must be at least 8 characters and contain uppercase, lowercase, number and special character"
        );
    }

    if (!["customer", "worker"].includes(role)) {
        throw new Error("Invalid role");
    }
};

const validateLoginData = ({ email, password }) => {

    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Email is invalid");
    }
};

module.exports = {
    validateSignupData,
    validateLoginData
};
