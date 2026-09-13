const validator = require("validator");
const mongoose = require("mongoose");

const validateBootstrapAdmin = ({
    fullName,
    email,
    password,
    cooperativeId
}) => {
    if (
        typeof fullName !== "string" ||
        !fullName.trim()
    ) {
        throw new Error("Full name is required");
    }

    if (
        fullName.trim().length < 3 ||
        fullName.trim().length > 50
    ) {
        throw new Error(
            "Full name must be between 3-50 characters"
        );
    }

    if (
        typeof email !== "string" ||
        !validator.isEmail(email.trim())
    ) {
        throw new Error("Email is invalid");
    }

    if (
        typeof password !== "string" ||
        !validator.isStrongPassword(password, {
            minLength: 8,
            maxLength: 128,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
    ) {
        throw new Error(
            "Password must be at least 8 characters and contain uppercase, lowercase, number and special character"
        );
    }

    if (
        typeof cooperativeId !== "string" ||
        !mongoose.Types.ObjectId.isValid(cooperativeId)
    ) {
        throw new Error("Invalid cooperative ID");
    }
};

module.exports = {
    validateBootstrapAdmin
};