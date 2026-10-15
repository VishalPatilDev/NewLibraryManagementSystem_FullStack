import axiosInstance from "./axiosInstance";

const BASE_URL = "/members";

const USER_BASE_URL = "/user";
const ACADEMIC_YEAR_BASE_URL = "/academic-years"

const register = async (memberData) => {
  const response = await axiosInstance.post(
    `${USER_BASE_URL}/member`,
    memberData
  );

  return response.data.data ?? response.data;
};


const getAll = async (params = {}) => {
  const response = await axiosInstance.get(BASE_URL, { params });
  return response.data.data;
};

const getById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

const getByUserId = async (userId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/user/${userId}`
  );
  return response.data.data;
};

const getByMembershipNumber = async (membershipNumber) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/number/${membershipNumber}`
  );
  return response.data.data;
};

const search = async (params = {}) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/search`,
    { params }
  );
  return response.data.data;
};

const update = async (id, memberData) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/${id}`,
    memberData
  );
  return response.data.data;
};

const updateStatus = async (id, status) => {
  const response = await axiosInstance.patch(
    `${BASE_URL}/${id}/status`,
    null,
    { params: { status } }
  );
  return response.data.data;
};

const remove = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data.data;
};
// --------------------------------------------------
// Update Member Type
// --------------------------------------------------
// Backend:
// PATCH /pjsofttech/library/members/{id}/type?memberType=STUDENT
const updateType = async (id, memberType) => {
  const response = await axiosInstance.patch(
    `${BASE_URL}/${id}/type`,
    null,
    {
      params: {
        memberType,
      },
    }
  );

  return response.data.data;
};

const getAcademicYears = async () => {
  const response = await axiosInstance.get(ACADEMIC_YEAR_BASE_URL);
  return response.data.data;
};


export default {
  register,
  getAll,
  getById,
  getByUserId,
  getByMembershipNumber,
  search,
  update,
  updateStatus,
  updateType,
  remove,
  getAcademicYears
};
