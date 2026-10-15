import axiosInstance from "./axiosInstance";

const BASE_URL = "/payments";

const createFinePaymentOrder = async (fineId) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/fine/${fineId}/order`
  );
  return response.data.data;
};

const verifyPayment = async (paymentData) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/verify`,
    paymentData
  );
  return response.data.data;
};

export default {
  createFinePaymentOrder,
  verifyPayment,
};
