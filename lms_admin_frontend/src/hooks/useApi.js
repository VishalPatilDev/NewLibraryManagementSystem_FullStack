import { useContext } from "react";
import { ApiContext } from "../context/ApiContext";

const useApi = () => {
  const context = useContext(ApiContext);

  if (!context) {
    throw new Error("useApi must be used inside ApiContextProvider");
  }

  return context;
};

export default useApi;
