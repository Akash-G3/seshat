
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMyWorkspace } from "@features/workspace/api/workspace.api";
import type { Workspace } from "@features/workspace/types/workspace.types";

interface AuthContextValue {
  workspace: Workspace | null;
  isLoading: boolean;
  setWorkspace: (workspace: Workspace | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PUBLIC_PATHS = ["/", "/login", "/signup", "/verify-email"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Public pages do not need an authenticated workspace request.
    // This also prevents expected 401s from appearing on the login/signup
    // pages when there is no existing session.
    const pathname = window.location.pathname;
    const isPublicPath =
      PUBLIC_PATHS.includes(pathname) ||
      pathname.startsWith("/share/");

    if (isPublicPath) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    setIsLoading(true);

    getMyWorkspace()
      .then((nextWorkspace) => {
        if (!cancelled) setWorkspace(nextWorkspace);
      })
      .catch(() => {
        if (!cancelled) setWorkspace(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ workspace, isLoading, setWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
