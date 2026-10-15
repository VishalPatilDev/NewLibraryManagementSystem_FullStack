import axiosInstance from "./axiosInstance";

const BASE_URL = "/dashboard";

const getStats = async () => {
    const response = await axiosInstance.get(`${BASE_URL}/stats`);
    return response.data.data;
};

export default {
    getStats,
};
