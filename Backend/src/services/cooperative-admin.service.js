const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Worker = require("../models/Worker");
const Booking = require("../models/Booking");
const Service = require("../models/Service");

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

const getDashboardStats = async (adminId) => {
    const admin = await CooperativeAdmin.findOne({
        userId: adminId,
        isActive: true
    });

    if (!admin) {
        throw new Error("Cooperative admin not found");
    }

    const cooperativeId = admin.cooperativeId;

    const [
        totalWorkers,
        approvedWorkers,
        pendingWorkers,
        rejectedWorkers,
        totalServices,
        activeServices
    ] = await Promise.all([
        Worker.countDocuments({ cooperativeId }),

        Worker.countDocuments({
            cooperativeId,
            verificationStatus: "approved"
        }),

        Worker.countDocuments({
            cooperativeId,
            verificationStatus: "pending"
        }),

        Worker.countDocuments({
            cooperativeId,
            verificationStatus: "rejected"
        }),

        Service.countDocuments({ cooperativeId }),

        Service.countDocuments({
            cooperativeId,
            isActive: true
        })
    ]);

    const serviceIds = await Service.find({
        cooperativeId
    }).distinct("_id");

    const [
        totalBookings,
        pendingBookings,
        completedBookings
    ] = await Promise.all([
        Booking.countDocuments({
            serviceId: { $in: serviceIds }
        }),

        Booking.countDocuments({
            serviceId: { $in: serviceIds },
            status: "pending"
        }),

        Booking.countDocuments({
            serviceId: { $in: serviceIds },
            status: "completed"
        })
    ]);

    return {
        workers: {
            total: totalWorkers,
            approved: approvedWorkers,
            pending: pendingWorkers,
            rejected: rejectedWorkers
        },

        services: {
            total: totalServices,
            active: activeServices
        },

        bookings: {
            total: totalBookings,
            pending: pendingBookings,
            completed: completedBookings
        }
    };
};

module.exports = {
    createCooperativeAdmin,
    getDashboardStats
};
