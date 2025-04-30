import axios from "./axiosConfig";

export const getPaginatedMindmaps = async (data) => {
	try {
		const response = await axios.get("/mindmaps", {
			params: {
				page: data.currentPage,
				limit: data.itemsPerPage,
				sortBy: data.sortBy,
				sortOrder: data.sortOrder,
				owner: data.owner,
				participant: data.participant,
				isPublic: data.isPublic,
				favorite: data.favorite,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching mindmaps: ", error);
		throw error;
	}
};

export const createMindmap = async (data) => {
	try {
		const response = await axios.post(`/mindmaps/`, data);
		return response.data;
	} catch (error) {
		console.error("Error creating mindmap", error);
		throw error;
	}
};

export const getMindmap = async (id) => {
	try {
		const response = await axios.get(`/mindmaps/${id}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching mindmap", error);
		throw error;
	}
};

export const updateMindmap = async (id, data) => {
	try {
		const response = await axios.patch(`/mindmaps/${id}`, data);
		return response.data;
	} catch (error) {
		console.error("Error updating mindmap", error);
		throw error;
	}
};

export const deleteMindmap = async (id) => {
	try {
		const response = await axios.delete(`/mindmaps/${id}`);
		return response.data;
	} catch (error) {
		console.error("Error deleting mindmap", error);
		throw error;
	}
};
