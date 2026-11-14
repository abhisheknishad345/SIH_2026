
import api from "./api";

// Fetch categories available in a cooperative
export const getServiceCategories = (cooperativeId) => {
    return api.get("/services/categories", {
        params: { cooperativeId }
    });
};

// Fetch services by cooperative and category
export const getActiveServices = (cooperativeId, category) => {
    return api.get("/services", {
        params: {
            cooperativeId,
            category
        }
    });
};
