
const validateService = ({
    name,
    description,
    category
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
};

module.exports = {
    validateService
};