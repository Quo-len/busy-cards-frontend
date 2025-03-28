import axios from "axios";

export const getPaginatedMindmaps = async (page, limit) => {
   try {
    const response = await axios.get('/api/mindmaps', {
        params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};