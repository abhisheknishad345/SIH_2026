const mongoose = require("mongoose");
const validator = require("validator");

const validateCooperativeAdmin = ({
    fullName,
    email,
    cooperativeId
}) => {

    if (typeof fullName !== "string" || !fullName.trim()) {
        throw new Error("Full name is required");
    }

    if (!/^[A-Za-z\s]+$/.test(fullName.trim())) {
        throw new Error("Full name can contain only letters and spaces");
    }

    if (fullName.trim().length < 3 || fullName.trim().length > 50) {
        throw new Error("Full name must be between 3-50 characters");
    }

    if (typeof email !== "string" || !validator.isEmail(email)) {
        throw new Error("Email is invalid");
    }

    if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
        throw new Error("Invalid cooperative ID");
    }
};

module.exports = {
    validateCooperativeAdmin
};