
import api from "./api";

// Get logged-in worker profile
export const getWorkerProfile = () => {
    return api.get("/workers/profile");
};

// Create worker profile
export const createWorkerProfile = (data) => {
    return api.post("/workers/profile", data);
};

// Update existing worker profile
export const updateWorkerProfile = (data) => {
    return api.put("/workers/editprofile", data);
};

// Resubmit rejected profile
export const resubmitWorkerProfile = () => {
    return api.put("/workers/profile/resubmit");
};
