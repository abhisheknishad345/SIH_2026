const bcrypt = require("bcryptjs");
const User = require("../models/User");
const validatePassword = require("../validator/auth.validator")

const createSuperAdmin = async ({
    fullName,
    email,
    password
}) => {

    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Email already registered");
    }
        validatePassword(password)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role: "super_admin",
        emailVerified: true
    });

    return {
        message: "Super admin created successfully",
        admin: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }
    };
};

module.exports = {
    createSuperAdmin
};