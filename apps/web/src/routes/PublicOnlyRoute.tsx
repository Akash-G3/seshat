import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@app/AuthContext";

export function PublicOnlyRoute() {
  const { workspace, isLoading } = useAuth();

  // No spinner here on purpose: the common case is a logged-out user
  // just wants to see the login form, and flashing a loading state on
  // every /login visit would be worse UX than the rare case (already
  // logged in) briefly showing the form before redirecting away.
  if (!isLoading && workspace) {
    return <Navigate to="/workspace" replace />;
  }

  return <Outlet />;
}