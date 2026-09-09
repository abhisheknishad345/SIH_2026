import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: 'localhost' only works in a web/simulator context.
// For a physical device or Android emulator, replace with your computer's
// LAN IP, e.g. http://192.168.1.50:3000/api  (find it with `ipconfig`/`ifconfig`)
export const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
