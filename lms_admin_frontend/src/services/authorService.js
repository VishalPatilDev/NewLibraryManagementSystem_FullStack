import axiosInstance from "./axiosInstance";

const BASE_URL = "/authors";

const create = async (authorData) => {
  const response = await axiosInstance.post(BASE_URL, authorData);
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

const search = async (params = {}) => {
  const response = await axiosInstance.get(`${BASE_URL}/search`, { params });
  return response.data.data;
};

const update = async (id, authorData) => {
  const response = await axiosInstance.put(`${BASE_URL}/${id}`, authorData);
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
