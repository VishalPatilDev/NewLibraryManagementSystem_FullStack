import { createContext, useEffect, useState } from "react";
import authService from "../services/authService";
import userService from "../services/userService";

export const ApiContext = createContext(null);

const ApiContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      setLoadingUser(true);
      setAuthError(null);

      const user = await userService.getCurrentUser();

      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);

      localStorage.removeItem("token");
      setCurrentUser(null);
      setAuthError(error);
    } finally {
      setLoadingUser(false);
    }
  };

  const login = async (credentials) => {
    try {
      setAuthError(null);

      const token = await authService.login(credentials);

      localStorage.setItem("token", token);

      await fetchCurrentUser();

      return true;
    } catch (error) {
      console.error("Login failed:", error);

      setAuthError(error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setAuthError(null);

      await authService.register(userData);

      return true;
    } catch (error) {
      console.error("Registration failed:", error);

      setAuthError(error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetchCurrentUser();
    } else {
      setLoadingUser(false);
    }
  }, []);

  const value = {
    currentUser,
    loadingUser,
    authError,
    login,
    register,
    logout,
    fetchCurrentUser,
    isAuthenticated: !!currentUser,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContextProvider;
