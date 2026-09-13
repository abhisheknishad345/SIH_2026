const mongoose = require("mongoose");

const validateRating = ({
    bookingId,
    rating,
    review
}) => {

    if (
        typeof bookingId !== "string" ||
        !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
        throw new Error("Invalid booking ID");
    }

    if (
        typeof rating !== "number" ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {
        throw new Error(
            "Rating must be an integer between 1 and 5"
        );
    }

    if (review !== undefined) {
        if (
            typeof review !== "string" ||
            review.trim().length > 500
        ) {
            throw new Error(
                "Review must be valid text and cannot exceed 500 characters"
            );
        }
    }
};

module.exports = {
    validateRating
};