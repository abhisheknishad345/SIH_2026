const bookingService = require("../services/booking.service");
const mongoose = require("mongoose");
const {
    validateBooking, validateBookingStatus
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

const getWorkerBookings = async (req, res) => {
    try {
        const result =
            await bookingService.getWorkerBookings(
                req.user._id
            );

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({
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

module.exports = {
    createBooking, getWorkerBookings, updateBookingStatus, getCustomerBookings
};