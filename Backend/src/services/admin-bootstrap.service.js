const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Cooperative = require("../models/Cooperative");
const CooperativeAdmin = require("../models/CooperativeAdmin");

const createBootstrapAdmin = async ({
    fullName,
    email,
    password,
    cooperativeId
}) => {
    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const cooperative = await Cooperative.findById(
        cooperativeId
    );

    if (!cooperative) {
        throw new Error("Cooperative not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role: "cooperative_admin",
        emailVerified: true
    });

    const admin = await CooperativeAdmin.create({
        userId: user._id,
        cooperativeId
    });

    return {
        message: "Bootstrap admin created successfully",
        admin: {
            id: admin._id,
            userId: user._id,
            cooperativeId: cooperative._id,
            email: user.email,
            fullName: user.fullName
        }
    };
};

module.exports = {
    createBootstrapAdmin
};