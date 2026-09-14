/**
 * src/lib/api-client.ts
 *
 * Single axios instance for the whole app. `withCredentials: true` is
 * required for the httpOnly access/refresh cookies to be sent and received.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let refreshPromise: Promise<unknown> | null = null;

const PUBLIC_PATHS = ["/", "/login", "/signup", "/verify-email"];

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
      const isOnPublicPath =
        PUBLIC_PATHS.includes(window.location.pathname) ||
        window.location.pathname.startsWith("/share/");

      if (!isOnPublicPath) {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  },
);
