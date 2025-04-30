import axios from "./axiosConfig";

export const registration = async (email, username, password) => {
	try {
		const response = await axios.post("/auth/register", {
			email,
			username,
			password,
		});
		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		return {
			success: false,
			error: error.response?.data?.error || "Невідома помилка під час реєстрації",
		};
	}
};

export const login = async (email, password) => {
	let response;
	try {
		response = await axios.post(`/auth/login`, { email, password });
		return { token: response.data.token };
	} catch (error) {
		console.error("Помилка авторизації:", error);

		return { error: error.response.data.error };
	}
};

export const updatePassword = async (currentPassword, newPassword) => {
	try {
		const response = await axios.post(`/password`, { currentPassword, newPassword });
		return response.data;
	} catch (error) {
		console.error("Помилка оновлення пароля:", error);
		throw error;
	}
};

export const forgotPassword = async () => {
	try {
		const response = await axios.post(`/forgotPassword`, {});
		return response.data;
	} catch (error) {
		console.error("Помилка відновлення пароля:", error);
		throw error;
	}
};

export const resetPassword = async () => {
	try {
		const response = await axios.post(`/forgotPassword`, {});
		return response.data;
	} catch (error) {
		console.error("Помилка скидання пароля:", error);
		throw error;
	}
};
