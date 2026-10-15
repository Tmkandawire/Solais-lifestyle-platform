import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

let accessToken: string | null = null;

/**
 * Registered by AuthProvider.
 *
 * Refreshes the session and returns a new access token,
 * or null when the session could not be refreshed.
 */
type SessionRefresher = () => Promise<string | null>;

let sessionRefresher: SessionRefresher | null = null;

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Keeps the current access token available to the API client.
 *
 * The refresh token remains in the backend-managed HTTP-only cookie.
 * The access token is held in memory and attached to protected requests
 * through the Authorization header.
 */
export function setApiAccessToken(token: string | null): void {
  accessToken = token;
}

export function setSessionRefresher(refresher: SessionRefresher | null): void {
  sessionRefresher = refresher;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
];

type RetriableConfig = InternalAxiosRequestConfig & {
  _retried?: boolean;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(
        error instanceof Error ? error : new Error("Request failed."),
      );
    }

    const original = error.config as RetriableConfig | undefined;
    const url = original?.url ?? "";

    const shouldRetry =
      error.response?.status === 401 &&
      original !== undefined &&
      !original._retried &&
      Boolean(original.headers.Authorization) &&
      sessionRefresher !== null &&
      !AUTH_PATHS.some((path) => url.includes(path));

    if (!shouldRetry || !original || !sessionRefresher) {
      return Promise.reject(error);
    }

    original._retried = true;

    const token = await sessionRefresher();

    if (!token) {
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${token}`;

    return apiClient(original);
  },
);
