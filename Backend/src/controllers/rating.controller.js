const mongoose = require("mongoose");

const ratingService = require("../services/rating.service");

const {
    validateRating
} = require("../validator/rating.validator");


const createRating = async (req, res) => {
    try {
        validateRating(req.body);

        const result =
            await ratingService.createRating({
                bookingId: req.body.bookingId,
                customerId: req.user._id,
                rating: req.body.rating,
                review: req.body.review
            });

        res.status(201).json(result);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const getWorkerRatings = async (req, res) => {
    try {
        const { workerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                message: "Invalid worker ID"
            });
        }

        const result =
            await ratingService.getWorkerRatings(
                workerId
            );

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};


module.exports = {
    createRating, getWorkerRatings
};