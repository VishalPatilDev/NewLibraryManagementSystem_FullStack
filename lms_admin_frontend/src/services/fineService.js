import axiosInstance from "./axiosInstance";

const BASE_URL = "/fines";
const PAYMENT_BASE_URL = "/payments";

const getById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

const getByLoan = async (loanId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/loan/${loanId}`
  );
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

const getPendingTotal = async (memberId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/member/${memberId}/pending-total`
  );
  return response.data.data;
};

const waive = async (id, data) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/${id}/waive`,
    data
  );
  return response.data.data;
};

// Create Razorpay order
const createPaymentOrder = async (fineId) => {
  const response = await axiosInstance.post(
    `${PAYMENT_BASE_URL}/fine/${fineId}/order`
  );

  return response.data.data;
};
// Verify Razorpay payment
const verifyPayment = async (data) => {
  const response = await axiosInstance.post(
    `${PAYMENT_BASE_URL}/verify`,
    data
  );

  return response.data.data;
};

export default {
  getById,
  getByLoan,
  getAll,
  getByMember,
  getPendingTotal,
  waive,
  createPaymentOrder,
  verifyPayment,
};
