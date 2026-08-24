/**
 * src/lib/api-client.ts
 *
 * Single axios instance for the whole app. `withCredentials: true` is
 * required for the httpOnly access/refresh cookies to be sent and
 * received — without it, requests silently go out unauthenticated.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://localhost:4000/api
  withCredentials: true,
});

// Ensures concurrent 401s share one refresh call instead of racing.
let refreshPromise: Promise<unknown> | null = null;

// Routes that render without a session. If a refresh fails while
// already on one of these, do NOT redirect — see the note below on
// why that matters.
const PUBLIC_PATHS = ["/login", "/signup"];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    const isUnauthorized = error.response?.status === 401;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
    const alreadyRetried = originalRequest?._retry;

    if (!isUnauthorized || isRefreshCall || alreadyRetried || !originalRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= apiClient.post("/auth/refresh").finally(() => {
        refreshPromise = null;
      });
      await refreshPromise;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // BUG WE HIT: redirecting unconditionally here caused an
      // infinite loop. If the user is already on /login or /signup
      // (e.g. AuthContext's own session check 401s there), setting
      // location.href to the same page still forces a full reload,
      // which remounts everything, re-triggers the same failed
      // check, and redirects again — forever, hammering the backend
      // each cycle.
      //
      // Only force-navigate away if we're somewhere that actually
      // requires a session. If we're already on a public page, just
      // let the request fail normally — the calling code (e.g.
      // AuthContext catching the initial getMyWorkspace() call)
      // already handles that by setting workspace to null, no
      // reload needed.
      const isOnPublicPath = PUBLIC_PATHS.includes(window.location.pathname);
      if (!isOnPublicPath) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  }
);