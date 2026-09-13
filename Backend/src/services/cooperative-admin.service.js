const bcrypt = require("bcryptjs");
const crypto = require("crypto")
const mongoose = require("mongoose");
const {cooperativeAdminCreatedEmail} = require("./email.service");

const User = require("../models/User");
const CooperativeAdmin = require("../models/CooperativeAdmin");
const Cooperative = require("../models/Cooperative");

const createCooperativeAdmin = async ({
    fullName,
    email,
    cooperativeId
}) => {

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        email = email.toLowerCase().trim();

        const cooperative = await Cooperative.findById(
            cooperativeId
        ).session(session);

        if (!cooperative) {
            throw new Error("Cooperative not found");
        }

        const existingUser = await User.findOne({
            email
        }).session(session);

        if (existingUser) {
            throw new Error("Email already registered");
        }

        const temporaryPassword =
            crypto.randomBytes(9).toString("base64");

        const hashedPassword =
            await bcrypt.hash(temporaryPassword, 10);

        const [user] = await User.create(
            [{
                fullName,
                email,
                password: hashedPassword,
                role: "cooperative_admin",
                emailVerified: true
            }],
            { session }
        );

        const [admin] = await CooperativeAdmin.create(
            [{
                userId: user._id,
                cooperativeId
            }],
            { session }
        );

        await session.commitTransaction();
        await cooperativeAdminCreatedEmail(email, fullName);

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

    } catch (error) {

        await session.abortTransaction();

        throw error;

    } finally {

        session.endSession();

    }
};

module.exports = {
    createCooperativeAdmin
};