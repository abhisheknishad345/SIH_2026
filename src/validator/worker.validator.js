
const validateSkill = (skill) => {
    if (!skill || typeof skill !== "object") {
        throw new Error("Each skill must be an object");
    }

    if (
        typeof skill.name !== "string" ||
        !skill.name.trim()
    ) {
        throw new Error("Skill name must be valid text");
    }

    if (
        typeof skill.price !== "number" ||
        skill.price < 0
    ) {
        throw new Error("Skill price must be a non-negative number");
    }

    if (
        !["per_hour", "per_visit", "per_day", "fixed"].includes(
            skill.priceType
        )
    ) {
        throw new Error("Invalid skill price type");
    }
};


const validateWorkerProfile = ({
    category,
    skills,
    experience,
    certifications,
    location
}) => {

    const allowedCategories = [
        "Plumber",
        "Electrician",
        "Carpenter",
        "Painter",
        "Cleaner",
        "Gardener",
        "Driver",
        "Caregiver",
        "Technician"
    ];

    if (!allowedCategories.includes(category)) {
        throw new Error("Invalid worker category");
    }

    if (!Array.isArray(skills) || skills.length === 0) {
        throw new Error("At least one skill is required");
    }

    skills.forEach(validateSkill);

    if (
        typeof experience !== "number" ||
        !Number.isInteger(experience) ||
        experience < 0
    ) {
        throw new Error("Experience must be a non-negative integer");
    }

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
    experience,
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

    if (experience !== undefined) {

        if (
            typeof experience !== "number" ||
            !Number.isInteger(experience) ||
            experience < 0
        ) {
            throw new Error(
                "Experience must be a non-negative integer"
            );
        }
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