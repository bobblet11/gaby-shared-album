import axios from "axios";
import {config} from "../configs/config.js"

// Create a reusable axios instance
const client = axios.create({
        baseURL: config.api.domain,
        timeout: 10000, // request timeout in ms
        headers: {
                "Content-Type": "application/json",
        },
});

// Optional: add interceptors for auth, logging, error handling
client.interceptors.request.use(
        (config) => {
                // Example: attach token if available
                // const token = localStorage.getItem("authToken");
                // if (token) {
                //         config.headers.Authorization = `Bearer ${token}`;
                // }
                return config;
        },
        (error) => Promise.reject(error),
);

client.interceptors.response.use(
        (response) => response,
        (error) => {
                // // Centralized error handling
                // if (error.response?.status === 401) {
                //         // e.g., redirect to login
                //         console.error("Unauthorized, redirecting...");
                // }
                return Promise.reject(error);
        },
);

export default client;
