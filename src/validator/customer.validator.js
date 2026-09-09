
const validateCustomerProfile = ({
    phone,
    address,
    location
}) => {

    if (phone !== undefined) {
        if (
            typeof phone !== "string" ||
            !/^[6-9]\d{9}$/.test(phone)
        ) {
            throw new Error("Invalid Indian phone number");
        }
    }

    if (address !== undefined) {
        if (
            typeof address !== "string" ||
            !address.trim()
        ) {
            throw new Error("Address must be valid text");
        }

        if (address.length > 200) {
            throw new Error(
                "Address cannot exceed 200 characters"
            );
        }
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
    validateCustomerProfile
};