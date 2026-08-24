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
      // Clear local state and redirect even if the network call
      // fails — a user clicking "log out" should always end up
      // logged out on their end, regardless of server hiccups.
      setWorkspace(null);
      navigate("/login", { replace: true });
    }
  };
}


//this component is for using anywhere as a button to logout 
// import { useLogout } from "@features/auth/useLogout";

// function LogoutButton() {
//   const logout = useLogout();
//   return (
//     <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">
//       Log out
//     </button>
//   );
// }