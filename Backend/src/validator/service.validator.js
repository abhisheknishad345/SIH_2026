
const validateService = ({
    name,
    description,
    category,
    price,
    priceType,
    estimatedDurationMinutes
}) => {
    if (
        typeof name !== "string" ||
        !name.trim()
    ) {
        throw new Error("Service name is required");
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
        throw new Error(
            "Service name must be between 2-100 characters"
        );
    }

    if (description !== undefined) {
        if (
            typeof description !== "string" ||
            description.length > 500
        ) {
            throw new Error(
                "Description must be valid text and cannot exceed 500 characters"
            );
        }
    }

    if (
        typeof category !== "string" ||
        !category.trim()
    ) {
        throw new Error("Service category is required");
    }

    if (
        category.trim().length < 2 ||
        category.trim().length > 100
    ) {
        throw new Error(
            "Category must be between 2-100 characters"
        );
    }

    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
        throw new Error("Valid price is required");
    }
    if (!["per_hour", "per_day", "fixed"].includes(priceType)) {
        throw new Error("Invalid price type. Use per_hour, per_day or fixed.");
    }
    if (priceType === "fixed" &&
        (!Number.isInteger(estimatedDurationMinutes) || estimatedDurationMinutes <= 0)) {
        throw new Error("Fixed-price services require a positive estimated duration in minutes");
    }

    
};

module.exports = {
    validateService
};