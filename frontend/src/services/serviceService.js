
import api from "./api";

export const getActiveServices = () => {
  return api.get("/services");
};
