import axios from './axiosConfig';

export const registration = async (email, username, password) => {
	try {
		const response = await axios.post('/auth/register', {
			email,
			username,
			password,
		});
		return response.data;
	} catch (error) {
		console.error('Error registering', error);
		throw error;
	}
};

export const login = async (email, password) => {
	try {
		const response = await axios.post(`/auth/login`, { email, password });
		return response.data.token;
	} catch (error) {
		console.error('Error logging in', error);
		throw error;
	}
};

export const updatePassword = async (currentPassword, newPassword) => {
	try {
		const response = await axios.post(`/password`, { currentPassword, newPassword });
		return response.data;
	} catch (error) {
		console.error('Error updating password', error);
		throw error;
	}
};

export const forgotPassword = async () => {
	try {
		const response = await axios.post(`/forgotPassword`, {});
		return response.data;
	} catch (error) {
		console.error('Error restoring forgotten password', error);
		throw error;
	}
};

export const resetPassword = async () => {
	try {
		const response = await axios.post(`/forgotPassword`, {});
		return response.data;
	} catch (error) {
		console.error('Error reseting password', error);
		throw error;
	}
};
