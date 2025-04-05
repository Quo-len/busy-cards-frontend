import axios from './axiosConfig';

export const getPaginatedMindmaps = async (page, limit) => {
	try {
		const response = await axios.get('/api/mindmaps', {
			params: {
				page: currentPage,
				limit: itemsPerPage,
				sortBy: sortBy,
				order: sortOrder,
			},
		});
		return response.data;
	} catch (error) {
		console.error('Error fetching products:', error);
		throw error;
	}
};

export const getMindmap = async (id) => {
	try {
		const response = await axios.get('/api/mindmaps', {
			params: {},
		});
		return response.data;
	} catch (error) {
		console.error('', error);
		throw error;
	}
};

export const updateMindmap = async () => {
	try {
		const response = await axios.get('/api/mindmaps', {
			params: {},
		});
		return response.data;
	} catch (error) {
		console.error('', error);
		throw error;
	}
};

export const deleteMindmap = async () => {
	try {
		const response = await axios.get('/api/mindmaps', {
			params: {},
		});
		return response.data;
	} catch (error) {
		console.error('', error);
		throw error;
	}
};

/*
    const response = await axios.get("/api/mindmaps", {
        params: {
            page: currentPage,
            limit: itemsPerPage,
            sortBy: sortBy,
            order: sortOrder,
        },
    });
*/
