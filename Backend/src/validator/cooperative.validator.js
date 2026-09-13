const validator = require("validator");

const validateCooperative = ({
    name,
    registrationNumber,
    contactEmail,
    contactPhone,
    address,
    location
}) => {

    if (
        typeof name !== "string" ||
        !name.trim()
    ) {
        throw new Error("Cooperative name is required");
    }

    if (
        name.trim().length < 2 ||
        name.trim().length > 100
    ) {
        throw new Error(
            "Cooperative name must be between 2-100 characters"
        );
    }


    if (
        typeof registrationNumber !== "string" ||
        !registrationNumber.trim()
    ) {
        throw new Error(
            "Registration number is required"
        );
    }


    if (!validator.isEmail(contactEmail)) {
        throw new Error(
            "Invalid cooperative email"
        );
    }


    if (contactPhone !== undefined) {
        if (
            typeof contactPhone !== "string" ||
            !/^[6-9]\d{9}$/.test(contactPhone)
        ) {
            throw new Error(
                "Invalid Indian phone number"
            );
        }
    }


    if (
        typeof address !== "string" ||
        !address.trim()
    ) {
        throw new Error("Cooperative address is required");
    }

    if (address.length > 200) {
        throw new Error(
            "Address cannot exceed 200 characters"
        );
    }


    if (location !== undefined) {

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
    }
};

module.exports = {
    validateCooperative
};