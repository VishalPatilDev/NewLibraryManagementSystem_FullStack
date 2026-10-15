import axiosInstance from "./axiosInstance";

const BASE_URL = "/academic-years";

const create = async (data) => {
  const response = await axiosInstance.post(BASE_URL, data);
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

const getActive = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/active`);
  return response.data.data;
};

const update = async (id, data) => {
  const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

const activate = async (id) => {
  const response = await axiosInstance.patch(`${BASE_URL}/${id}/activate`);
  return response.data.data;
};

export default {
  create,
  getById,
  getAll,
  getActive,
  update,
  activate,
};
