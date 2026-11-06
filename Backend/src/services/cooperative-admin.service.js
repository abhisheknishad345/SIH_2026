const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");

const { cooperativeAdminCreatedEmail } = require("./email.service");

const User = require("../models/User");
const CooperativeAdmin = require("../models/CooperativeAdmin");
const Cooperative = require("../models/Cooperative");

const createCooperativeAdmin = async ({
    fullName,
    email,
    cooperativeId
}) => {

    const session = await mongoose.startSession();

    let user;
    let admin;
    let cooperative;

    try {
        session.startTransaction();

        email = email.toLowerCase().trim();

        // Check cooperative
        cooperative = await Cooperative.findById(
            cooperativeId
        ).session(session);

        if (!cooperative) {
            throw new Error("Cooperative not found");
        }

        // Check existing user
        const existingUser = await User.findOne({
            email
        }).session(session);

        if (existingUser) {
            throw new Error("Email already registered");
        }

        // Generate temporary password
        const temporaryPassword =
            crypto.randomBytes(9).toString("base64");

        const hashedPassword = await bcrypt.hash(
            temporaryPassword,
            10
        );

        // Create user
        [user] = await User.create(
            [{
                fullName,
                email,
                password: hashedPassword,
                role: "cooperative_admin",
                emailVerified: true
            }],
            { session }
        );

        // Create cooperative admin
        [admin] = await CooperativeAdmin.create(
            [{
                userId: user._id,
                cooperativeId: cooperative._id
            }],
            { session }
        );

        // Commit transaction
        await session.commitTransaction();

    } catch (error) {

        // Abort only if transaction is still active
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;

    } finally {
        await session.endSession();
    }

    // Send email after successful database transaction
    try {
        await cooperativeAdminCreatedEmail(
            email,
            fullName
        );
    } catch (emailError) {
        console.error(
            "Cooperative admin email failed:",
            emailError.message
        );
    }

    return {
        message: "Cooperative admin created successfully",
        admin: {
            id: admin._id,
            userId: user._id,
            cooperativeId: cooperative._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        }
    };
};

module.exports = {
    createCooperativeAdmin
};
