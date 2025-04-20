import axios from "./axiosConfig";

export const getParticipants = async (mindmapId, userId) => {
	try {
		const response = await axios.get(`/participants/`, {
			params: {
				mindmapId,
				userId,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
};

export const addParticipant = async (mindmapId, userId, accessLevel = "Глядач") => {
	try {
		const response = await axios.post(`/participants/${mindmapId}/${userId}`, {
			accessLevel,
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
};

export const deleteParticipant = async (mindmapId, userId) => {
	try {
		const response = await axios.delete(`/participants/${mindmapId}/${userId}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
};

export const updateParticipant = async (mindmapId, userId, accessLevel) => {
	try {
		const response = await axios.patch(`/participants/${mindmapId}/${userId}`, {
			accessLevel,
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching products:", error);
		throw error;
	}
};
