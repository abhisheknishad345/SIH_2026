const Rating = require("../models/Rating");
const Booking = require("../models/Booking");
const Worker = require("../models/Worker");

const createRating = async ({
    bookingId,
    customerId,
    rating,
    review
}) => {
    // Check booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new Error("Booking not found");
    }

    // Check: booking isi customer ki hai?
    if (
        booking.customerId.toString() !==
        customerId.toString()
    ) {
        throw new Error(
            "You are not allowed to rate this booking"
        );
    }

    // Only completed booking can be rated
    if (booking.status !== "completed") {
        throw new Error(
            "Only completed bookings can be rated"
        );
    }

    // Check duplicate rating
    const existingRating = await Rating.findOne({
        bookingId
    });

    if (existingRating) {
        throw new Error(
            "This booking has already been rated"
        );
    }

    // Create rating
    const newRating = await Rating.create({
        bookingId,
        customerId,
        workerId: booking.workerId,
        rating,
        review
    });

    return {
        message: "Rating submitted successfully",
        rating: newRating
    };
};

const getWorkerRatings = async (workerId) => {

    const worker = await Worker.findOne({
        userId: workerId
    });

    if (!worker) {
        throw new Error("Worker not found");
    }

    const ratings = await Rating.find({
        workerId
    })
        .populate("customerId", "fullName")
        .sort({ createdAt: -1 });

    const totalRatings = ratings.length;

    const averageRating =
        totalRatings === 0
            ? 0
            : ratings.reduce(
                (sum, item) => sum + item.rating,
                0
            ) / totalRatings;

    return {
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings,
        ratings
    };
};

const getWorkerRatingSummary = async (workerIds) => {
    const summaries = await Rating.aggregate([
        {
            $match: {
                workerId: { $in: workerIds }
            }
        },
        {
            $group: {
                _id: "$workerId",
                averageRating: { $avg: "$rating" },
                totalRatings: { $sum: 1 }
            }
        }
    ]);

    return summaries;
};

module.exports = {
    createRating, getWorkerRatings, getWorkerRatingSummary
};