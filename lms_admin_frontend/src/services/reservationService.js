import axiosInstance from "./axiosInstance";

const BASE_URL = "/reservations";

const reserve = async (reservationData) => {
  const response = await axiosInstance.post(
    BASE_URL,
    reservationData
  );
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

const getByMember = async (memberId, params = {}) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/member/${memberId}`,
    { params }
  );
  return response.data.data;
};

const cancel = async (id) => {
  const response = await axiosInstance.patch(
    `${BASE_URL}/${id}/cancel`
  );
  return response.data.data;
};

export default {
  reserve,
  getById,
  getAll,
  getByMember,
  cancel,
};
