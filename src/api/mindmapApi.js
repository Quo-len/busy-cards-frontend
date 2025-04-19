import axios from './axiosConfig';

export const getPaginatedMindmaps = async (currentPage, itemsPerPage, sortBy, sortOrder) => {
	try {
		const response = await axios.get('/mindmaps', {
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
		const response = await axios.get(`/mindmaps/${id}`);
		return response.data;
	} catch (error) {
		console.error('', error);
		throw error;
	}
};

export const updateMindmap = async (id, data) => {
	try {
		const response = await axios.patch(`/mindmaps/${id}`, data);
		return response.data;
	} catch (error) {
		console.error('', error);
		throw error;
	}
};

// export const deleteMindmap = async () => {
// 	try {
// 		const response = await axios.get('/mindmaps', {
// 			params: {},
// 		});
// 		return response.data;
// 	} catch (error) {
// 		console.error('', error);
// 		throw error;
// 	}
// };

/*
    const response = await axios.get("/mindmaps", {
        params: {
            page: currentPage,
            limit: itemsPerPage,
            sortBy: sortBy,
            order: sortOrder,
        },
    });
*/
