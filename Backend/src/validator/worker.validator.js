

const mongoose = require("mongoose");

const validateSkill = (skill) => {
    if (!skill || typeof skill !== "object") {
        throw new Error("Each skill must be an object");
    }

    if (!mongoose.Types.ObjectId.isValid(skill.serviceId)) {
        throw new Error("Invalid service ID");
    }

    if (
        typeof skill.experience !== "number" ||
        !Number.isInteger(skill.experience) ||
        skill.experience < 0
    ) {
        throw new Error(
            "Skill experience must be a non-negative integer"
        );
    }
};



const validateWorkerProfile = ({
    category,
    skills,
    certifications,
    location,
    workingHours
}) => {

    console.log(workingHours);

    

    const allowedHours = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    if (
    typeof category !== "string" ||
    !category.trim()
) {
    throw new Error("Valid worker category is required");
}

    if (
    !Array.isArray(workingHours) ||
    !workingHours.every(hour => allowedHours.includes(hour.day))
) {
    throw new Error("Invalid working days");
}

    if (!Array.isArray(skills) || skills.length === 0) {
        throw new Error("At least one skill is required");
    }

    skills.forEach(validateSkill);

    

    if (certifications !== undefined && !Array.isArray(certifications)) {
        throw new Error("Certifications must be an array");
    }

    if (!location || location.type !== "Point") {
        throw new Error("Location must be a GeoJSON Point");
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


const validateWorkerProfileUpdate = ({
    skills,
    certifications,
    location,
    isAvailable
}) => {

    if (skills !== undefined) {

        if (!Array.isArray(skills) || skills.length === 0) {
            throw new Error("Skills must contain at least one skill");
        }

        skills.forEach(validateSkill);
    }


    if (certifications !== undefined) {

        if (!Array.isArray(certifications)) {
            throw new Error("Certifications must be an array");
        }
    }

    if (location !== undefined) {

        if (!location || location.type !== "Point") {
            throw new Error("Location must be a GeoJSON Point");
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
    }

    if (isAvailable !== undefined) {

        if (typeof isAvailable !== "boolean") {
            throw new Error("isAvailable must be a boolean");
        }
    }
};


module.exports = {
    validateWorkerProfile,
    validateWorkerProfileUpdate
};