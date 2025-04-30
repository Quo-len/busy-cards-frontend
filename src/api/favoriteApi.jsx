import axios from "./axiosConfig";

export const getFavorites = async (userId) => {
	try {
		const response = await axios.get("/favorites", {
			params: {
				userId,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching favorite: ", error);
		throw error;
	}
};

export const getFavorite = async (userId, mindmapId) => {
	try {
		const response = await axios.get(`/favorites/${userId}/${mindmapId}`);
		return response.data;
	} catch (error) {
		if (error.response?.status === 404) {
			//	console.warn('Favorite not found');
			return null;
		}
		//	console.error('Error fetching favorite', error);
		//throw error;
	}
};

export const addFavorite = async (userId, mindmapId) => {
	try {
		const response = await axios.post(`/favorites`, {
			userId,
			mindmapId,
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching favorite", error);
		throw error;
	}
};

export const deleteFavorite = async (userId, mindmapId) => {
	try {
		const response = await axios.delete(`/favorites`, {
			data: {
				userId,
				mindmapId,
			},
		});
		return response.data;
	} catch (error) {
		if (error.response?.status === 404) {
			console.warn("Favorite not found");
			return null;
		}
		console.error("Error deleting favorite", error);
		throw error;
	}
};
