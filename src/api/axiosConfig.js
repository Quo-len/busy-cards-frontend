import axios from './axiosConfig';

// Axios instance with base configuration
const axiosInstance = axios.create({
	baseURL: 'https://api.example.com/', // Replace with your base URL
	timeout: 10000, // Timeout after 10 seconds
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add request interceptor to include token in headers (if available)
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('authToken');
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
		// Handle specific errors here (e.g., 401, 500, etc.)
		if (error.response && error.response.status === 401) {
			// Handle unauthorized access (e.g., redirect to login)
			console.error('Unauthorized access! Please log in.');
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
