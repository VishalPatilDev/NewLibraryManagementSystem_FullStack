import axiosInstance from "./axiosInstance";

const register = async (userData) => {
  const response = await axiosInstance.post("/register", userData);

  return response.data;
};

const login = async (credentials) => {
  const response = await axiosInstance.post("/login", credentials);

  return response.data;
};

export default {
  register,
  login,
};
