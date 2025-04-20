import axios from 'axios';
import { getAuthTokenFromCookies, logout } from './../utils/utils';
import { useNavigate } from 'react-router-dom';

// Axios instance with base configuration
const axiosInstance = axios.create({
	baseURL: import.meta.env.DEV ? '/api/' : 'https://api.example.com/', // Replace with your base URL
	timeout: 10000, // Timeout after 10 seconds
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add request interceptor to include token in headers (if available)
axiosInstance.interceptors.request.use(
	(config) => {
		const token = getAuthTokenFromCookies();
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add response interceptor for centralized error handling
axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		const { status, data } = error.response;

		if (status === 401 && data.message === 'Token expired') {
			logout();
			alert('Session expired. Please log in again.');
		}

		if (status === 401 && data.message?.startsWith('Token is not valid')) {
			logout();
			alert('Invalid token. Please log in again.');
		}

		if (status === 401 && data) {
			console.error(data.message);
			alert(data.message);
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
