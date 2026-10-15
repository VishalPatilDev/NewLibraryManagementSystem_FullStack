import axiosInstance from "./axiosInstance";

const BASE_URL = "/categories";

const create = async (categoryData) => {
    const response = await axiosInstance.post(BASE_URL, categoryData);
    return response.data.data;
};

const getById = async (id) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data.data;
};

const getAll = async (params = {}) => {
    const response = await axiosInstance.get(BASE_URL, { params });
    return response.data.data;
};

const update = async (id, categoryData) => {
    const response = await axiosInstance.put(
        `${BASE_URL}/${id}`,
        categoryData
    );
    return response.data;
};

const remove = async (id) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
};

export default {
    create,
    getById,
    getAll,
    update,
    remove,
};
