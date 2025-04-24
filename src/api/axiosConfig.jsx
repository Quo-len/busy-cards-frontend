import axios from "axios";
import { getAuthTokenFromCookies, logout } from "../utils/utils";

// Axios instance with base configuration
const axiosInstance = axios.create({
	baseURL: import.meta.env.DEV ? "/api/" : "https://api.example.com/",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

axiosInstance.interceptors.request.use(
	(config) => {
		const token = getAuthTokenFromCookies();
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		const { status, data } = error.response;

		if (status === 401 && data.message === "Token expired") {
			logout();
			alert("Session expired. Please log in again.");
		}

		if (status === 401 && data.message?.startsWith("Token is not valid")) {
			logout();
			alert("Invalid token. Please log in again.");
		}

		if (status === 401 && data) {
			console.error(data.message);
			alert(data.message);
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
