import axiosInstance from "./axiosInstance";

const BASE_URL = "/racks";

const create = async (rackData) => {
    const response = await axiosInstance.post(BASE_URL, rackData);
    return response.data.data;
};

const getById = async (id) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data.data;
};

const getAll = async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data.data;
};

const search = async (keyword) => {
    const response = await axiosInstance.get(
        `${BASE_URL}/search`,
        { params: { keyword } }
    );
    return response.data.data;
};

const update = async (id, rackData) => {
    const response = await axiosInstance.put(
        `${BASE_URL}/${id}`,
        rackData
    );
    return response.data.data;
};

const remove = async (id) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data.data;
};

export default {
    create,
    getById,
    getAll,
    search,
    update,
    remove,
};
