import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@routes/ProtectedRoute";
import { PublicOnlyRoute } from "@routes/PublicOnlyRoute";
import { LoginForm } from "@features/auth/LoginForm";
import { SignupForm } from "@features/auth/SignupForm";
import { Workspace } from "@features/workspace/workspace"

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginForm /> },
      { path: "/signup", element: <SignupForm /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/workspace", element: <Workspace/> },
    ],
  },
]);