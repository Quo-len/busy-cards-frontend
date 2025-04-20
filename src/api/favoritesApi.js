import axios from './axiosConfig';

export const getFavorites = async (userId, currentPage, itemsPerPage, sortBy, sortOrder) => {
	try {
		const response = await axios.get('/favorites', {
			params: {
				userId,
				page: currentPage,
				limit: itemsPerPage,
				sortBy: sortBy,
				order: sortOrder,
			},
		});
		return response.data;
	} catch (error) {
		console.error('Error fetching mindmaps: ', error);
		throw error;
	}
};

export const addFavorite = async (userId, mindmapId) => {
	try {
		const response = await axios.post(`/favorites/`, {
			userId,
			mindmapId,
		});
		return response.data;
	} catch (error) {
		console.error('Error fetching mindmap', error);
		throw error;
	}
};

export const deleteFavorite = async (userId, mindmapId) => {
	try {
		const response = await axios.delete('/mindmaps', {
			userId,
			mindmapId,
		});
		return response.data;
	} catch (error) {
		console.error('Error deleting mindmap', error);
		throw error;
	}
};
