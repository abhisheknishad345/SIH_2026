const mongoose = require("mongoose");

const validateCommunityService = ({
    cooperativeId,
    title,
    description,
    category,
    skillName,
    scheduledAt,
    duration,
    location,
    address
}) => {

    if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
        throw new Error("Invalid cooperative ID");
    }

    if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length < 3 ||
        title.trim().length > 100
    ) {
        throw new Error("Title must be between 3-100 characters");
    }

    if (
        description !== undefined &&
        (typeof description !== "string" ||
            description.trim().length > 500)
    ) {
        throw new Error(
            "Description must be valid text and cannot exceed 500 characters"
        );
    }

    if (
        typeof category !== "string" ||
        !category.trim() ||
        category.trim().length < 2 ||
        category.trim().length > 100
    ) {
        throw new Error("Category must be between 2-100 characters");
    }

    if (
        typeof skillName !== "string" ||
        !skillName.trim() ||
        skillName.trim().length < 2 ||
        skillName.trim().length > 100
    ) {
        throw new Error("Skill name must be between 2-100 characters");
    }

    const date = new Date(scheduledAt);

    if (!scheduledAt || isNaN(date.getTime())) {
        throw new Error("Invalid scheduled date");
    }

    if (date <= new Date()) {
        throw new Error("Scheduled time must be in the future");
    }

    if (
        typeof duration !== "number" ||
        !Number.isInteger(duration) ||
        duration <= 0
    ) {
        throw new Error("Duration must be a positive number in minutes");
    }

    if (
        !location ||
        location.type !== "Point" ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
    ) {
        throw new Error("Invalid location");
    }

    const [longitude, latitude] = location.coordinates;

    if (
        typeof longitude !== "number" ||
        typeof latitude !== "number" ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
    ) {
        throw new Error("Invalid coordinates");
    }

    if (
        typeof address !== "string" ||
        !address.trim() ||
        address.trim().length > 200
    ) {
        throw new Error("Address is required and cannot exceed 200 characters");
    }
};

module.exports = {
    validateCommunityService
};