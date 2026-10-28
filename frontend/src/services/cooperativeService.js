// cooperativeService.js

import api from "./api";

export const getAllCooperatives = () => {
    return api.get("/cooperatives");
};