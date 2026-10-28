const bookingService = require("../services/booking.service");
const mongoose = require("mongoose");
const {validateBooking, validateBookingStatus
} = require("../validator/booking.validator");


const createBooking = async (req, res) => {
    try {
        validateBooking(req.body);

        const result =
            await bookingService.createBooking({
                customerId: req.user._id,
                workerId: req.body.workerId,
                serviceId: req.body.serviceId,
                scheduledAt: req.body.scheduledAt,
                duration: req.body.duration,
                address: req.body.address,
                location: req.body.location,
                skillName: req.body.skillName,
                quantity: req.body.quantity,
                
            });

        res.status(201).json(result);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getWorkerBookings = async (req, res, next) => {
    try {
        const { status } = req.query;
        const upcoming = req.query.upcoming === "true";

        const allowedStatuses = [
            "pending",
            "accepted",
            "rejected",
            "cancelled",
            "completed"
        ];

        if (
            status &&
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid booking status"
            });
        }

        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const result =
            await bookingService.getWorkerBookings({
                workerId: req.user._id,
                status,
                upcoming,
                page,
                limit
            });

        return res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {
        next(error);
        res.status(500).json({
            message: error.message
        });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        validateBookingStatus({ status });

        const result =
            await bookingService.updateBookingStatus({
                bookingId,
                workerId: req.user._id,
                status
            });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getCustomerBookings = async (req, res) => {
    try {
        const result =
            await bookingService.getCustomerBookings(
                req.user._id
            );

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getWorkerDashboardController = async (req, res) => {
    try {
        const workerId = req.user._id;

        const dashboard = await bookingService.getWorkerDashboard(workerId);

        return res.status(200).json({
            success: true,
            message: "Worker dashboard fetched successfully",
            data: dashboard
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch worker dashboard"
        });
    }
};

const getWorkerEarningsController = async (req, res) => {
    try {
        const workerId = req.user._id;

        const earnings = await bookingService.getWorkerEarnings(workerId);

        return res.status(200).json({
            success: true,
            message: "Worker earnings fetched successfully",
            data: earnings
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch worker earnings"
        });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        const result =
            await bookingService.cancelBooking({
                bookingId,
                customerId: req.user._id
            });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const completeBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        const result =
            await bookingService.completeBooking({
                bookingId,
                workerId: req.user._id
            });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};




module.exports = {
    createBooking, getWorkerBookings, updateBookingStatus, 
    getWorkerEarningsController,
    getWorkerDashboardController,
    getCustomerBookings, cancelBooking, completeBooking, 
};