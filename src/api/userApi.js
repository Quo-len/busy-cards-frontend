import axios from './axiosConfig';

export const getUsers = async (currentPage, itemsPerPage, sortBy, sortOrder) => {
	try {
		const response = await axios.get('/users', {
			params: {
				page: currentPage,
				limit: itemsPerPage,
				sortBy: sortBy,
				order: sortOrder,
			},
		});
		return response.data;
	} catch (error) {
		console.error('Error fetching users: ', error);
		throw error;
	}
};

export const getUser = async (id) => {
	try {
		const response = await axios.get(`/users/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching user: ', error);
		throw error;
	}
};

export const updateUser = async (id, data) => {
	try {
		const response = await axios.patch(`/users/${id}`, data);
		return response.data;
	} catch (error) {
		console.error('Error updating user: ', error);
		throw error;
	}
};

export const deleteUser = async (id) => {
	try {
		const response = await axios.delete(`/users/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting user: ', error);
		throw error;
	}
};
