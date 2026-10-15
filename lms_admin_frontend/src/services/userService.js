import axiosInstance from "./axiosInstance";

const BASE_URL = "/user";

const fetchAllUsers = async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
};


const fetchUserById = async (id) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
};

const updateUserById = async (id, data) => {
    const response = await axiosInstance.put(
        `${BASE_URL}/${id}`,
        data
    );
    return response.data;
};

const changePassword = async (id, data) => {
    const response = await axiosInstance.put(
        `${BASE_URL}/changePassword/${id}`,
        data
    );
    return response.data;
};

const deleteUser = async (id) => {
    const response = await axiosInstance.delete(
        `${BASE_URL}/${id}`
    );
    return response.data;
};

const updateUserRole = async (id, data) => {
    const response = await axiosInstance.patch(
        `${BASE_URL}/${id}/role`,
        data
    );
    return response.data;
};

const updateUserStatus = async (id, data) => {
    const response = await axiosInstance.patch(
        `${BASE_URL}/${id}/status`,
        data
    );
    return response.data;
};

const getCurrentUser = async () => {
    const response = await axiosInstance.get(`${BASE_URL}/me`);
    return response.data;
};

const updateCurrentUser = async (data) => {
    const response = await axiosInstance.put(
        `${BASE_URL}/me`,
        data
    );
    return response.data;
};

const changeCurrentUserPassword = async (data) => {
    const response = await axiosInstance.put(
        `${BASE_URL}/me/changePassword`,
        data
    );
    return response.data;
};

export default {
    fetchAllUsers,
    fetchUserById,
    updateUserById,
    changePassword,
    deleteUser,
    updateUserRole,
    updateUserStatus,
    getCurrentUser,
    updateCurrentUser,
    changeCurrentUserPassword,
};
