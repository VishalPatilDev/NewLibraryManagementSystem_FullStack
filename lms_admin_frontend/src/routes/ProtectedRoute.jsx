import { Navigate, Outlet } from "react-router-dom";
import useApi from "../hooks/useApi";

const ProtectedRoute = () => {
  const { isAuthenticated, loadingUser } = useApi();

  if (loadingUser) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
