import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { storage } from "./storage";
import { APP_CONSTANTS } from "../const/app";

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string>(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    // Handle global errors here (e.g., 401 Unauthorized -> clear token, redirect)
    if (error.response?.status === 401) {
      storage.remove(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
      // Redirect to login if needed
    }
    return Promise.reject(error);
  },
);

export { request };
