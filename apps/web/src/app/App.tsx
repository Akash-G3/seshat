import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@app/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { router } from "@app/router";

function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;