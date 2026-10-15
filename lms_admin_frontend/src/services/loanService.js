import axiosInstance from "./axiosInstance";

const BASE_URL = "/loans";

const issueBook = async (loanData) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/issue`,
    loanData
  );
  return response.data.data;
};

const returnBook = async (loanId) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/${loanId}/return`
  );
  return response.data.data;
};

const renewLoan = async (loanId) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/${loanId}/renew`
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

const getOverdue = async (params = {}) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/overdue`,
    { params }
  );
  return response.data.data;
};

export default {
  issueBook,
  returnBook,
  renewLoan,
  getById,
  getAll,
  getByMember,
  getOverdue,
};
