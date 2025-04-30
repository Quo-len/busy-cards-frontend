import axios from "./axiosConfig";

export const getPaginatedInvitations = async (data) => {
	try {
		const response = await axios.get("/invitations", {
			params: {
				page: data.currentPage,
				limit: data.itemsPerPage,
				sortBy: data.sortBy,
				sortOrder: data.sortOrder,
				receiver: data.owner,
				sender: data.participant,
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching invitations: ", error);
		throw error;
	}
};

export const createInvitation = async (data) => {
	try {
		const response = await axios.post(`/invitations/`, data);
		return response.data;
	} catch (error) {
		console.error("Error creating invitation", error);
		throw error;
	}
};

export const getInvitation = async (id) => {
	try {
		const response = await axios.get(`/invitations/${id}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching invitation", error);
		throw error;
	}
};

export const updateInvitation = async (id, data) => {
	try {
		const response = await axios.patch(`/invitations/${id}`, data);
		return response.data;
	} catch (error) {
		console.error("Error updating invitation", error);
		throw error;
	}
};

export const deleteInvitation = async () => {
	try {
		const response = await axios.delete("/invitations");
		return response.data;
	} catch (error) {
		console.error("Error deleting invitation", error);
		throw error;
	}
};
