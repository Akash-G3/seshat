import { useNavigate } from "react-router-dom";
import { useAuth } from "@app/AuthContext";
import { logoutRequest } from "./auth.api";

export function useLogout() {
  const navigate = useNavigate();
  const { setWorkspace } = useAuth();

  return async function logout() {
    try {
      await logoutRequest();
    } finally {
      setWorkspace(null);
      navigate("/login", { replace: true });
    }
  };
}
