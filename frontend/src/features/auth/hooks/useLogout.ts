import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  }, [logout, navigate]);
}