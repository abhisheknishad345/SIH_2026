const mongoose = require("mongoose");

const validateBooking = ({
    workerId,
    serviceId,
    scheduledAt,
    duration,
    address,
    location,
    skillName,
    quantity
}) => {

    if (
        typeof workerId !== "string" ||
        !mongoose.Types.ObjectId.isValid(workerId)
    ) {
        throw new Error("Invalid worker ID");
    }

    if (
        typeof serviceId !== "string" ||
        !mongoose.Types.ObjectId.isValid(serviceId)
    ) {
        throw new Error("Invalid service ID");
    }

    if (
        typeof skillName !== "string" ||
        !skillName.trim()
    ) {
        throw new Error("Skill name is required");
    }

    if (skillName.trim().length > 100) {
        throw new Error(
            "Skill name cannot exceed 100 characters"
        );
    }

    if (
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {
        throw new Error(
            "Quantity must be greater than 0"
        );
    }

    if (!scheduledAt) {
        throw new Error("Scheduled date and time is required");
    }

    const bookingDate = new Date(scheduledAt);

    if (isNaN(bookingDate.getTime())) {
        throw new Error("Invalid scheduled date and time");
    }

    if (bookingDate <= new Date()) {
        throw new Error(
            "Booking time must be in the future"
        );
    }

    if (
        typeof duration !== "number" ||
        !Number.isInteger(duration) ||
        duration <= 0
    ) {
        throw new Error("Duration must be a positive number in minutes");
    }

    if (
        typeof address !== "string" ||
        !address.trim()
    ) {
        throw new Error("Address is required");
    }

    if (address.trim().length > 200) {
        throw new Error(
            "Address cannot exceed 200 characters"
        );
    }

    if (!location || location.type !== "Point") {
        throw new Error(
            "Location must be a GeoJSON Point"
        );
    }

    if (
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
    ) {
        throw new Error(
            "Location coordinates must contain longitude and latitude"
        );
    }

    const [longitude, latitude] = location.coordinates;

    if (
        typeof longitude !== "number" ||
        longitude < -180 ||
        longitude > 180
    ) {
        throw new Error("Invalid longitude");
    }

    if (
        typeof latitude !== "number" ||
        latitude < -90 ||
        latitude > 90
    ) {
        throw new Error("Invalid latitude");
    }

};

const validateBookingStatus = ({ status }) => {
    if (!["accepted", "rejected", "completed"].includes(status)) {
        throw new Error(
            "Status must be either accepted or rejected"
        );
    }
};

module.exports = {
    validateBooking,
    validateBookingStatus
};