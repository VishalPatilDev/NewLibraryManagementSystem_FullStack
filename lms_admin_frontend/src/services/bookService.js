import axiosInstance from "./axiosInstance";

const BASE_URL = "/books";

const create = async (bookData) => {
  const response = await axiosInstance.post(BASE_URL, bookData);
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

const update = async (id, bookData) => {
  const response = await axiosInstance.put(`${BASE_URL}/${id}`, bookData);
  return response.data;
};

const remove = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data;
};

const addCopy = async (copyData) => {
  const response = await axiosInstance.post(`${BASE_URL}/copies`, copyData);
  return response.data.data;
};

const getCopies = async (bookId) => {
  const response = await axiosInstance.get(`${BASE_URL}/${bookId}/copies`);
  return response.data.data;
};

const updateCopyStatus = async (copyId, status) => {
  const response = await axiosInstance.patch(
    `${BASE_URL}/copies/${copyId}/status`,
    null,
    { params: { status } }
  );
  return response.data.data;
};

export default {
  create,
  getById,
  getAll,
  search,
  update,
  remove,
  addCopy,
  getCopies,
  updateCopyStatus,
};
