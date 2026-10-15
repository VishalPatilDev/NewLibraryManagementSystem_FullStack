import axiosInstance from "./axiosInstance";

const BASE_URL = "/editions";

const create = async (editionData) => {
  const response = await axiosInstance.post(BASE_URL, editionData);
  return response.data.data;
};

const getById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

const getByBook = async (bookId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/book/${bookId}`
  );
  return response.data.data;
};

const getLatest = async (bookId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/book/${bookId}/latest`
  );
  return response.data.data;
};

const update = async (id, editionData) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/${id}`,
    editionData
  );
  return response.data.data;
};

const markAsLatest = async (id) => {
  const response = await axiosInstance.patch(
    `${BASE_URL}/${id}/mark-latest`
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
  getByBook,
  getLatest,
  update,
  markAsLatest,
  remove,
};
