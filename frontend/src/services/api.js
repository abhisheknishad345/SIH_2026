import axios from "axios";
const URL = import.meta.env.VITE_DEV_URL

const api = axios.create({
  baseURL: URL,
   withCredentials: true
});

export default api;
