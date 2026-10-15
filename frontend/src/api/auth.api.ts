import { apiClient } from "./client";

import type { AccountProfile } from "../types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    sessionId: string;
    refreshTokenExpiresAt: string;
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);

  return response.data;
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/auth/register",
    payload,
  );

  return response.data;
}

let refreshPromise: Promise<AuthResponse> | null = null;

export async function refreshAccessToken(): Promise<AuthResponse> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = apiClient
    .post<AuthResponse>("/auth/refresh")
    .then((response) => response.data)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export interface CurrentAccountResponse {
  success: boolean;
  message: string;
  data: AccountProfile;
}

export async function getCurrentAccount(): Promise<CurrentAccountResponse> {
  const response = await apiClient.get<CurrentAccountResponse>("/auth/me");

  return response.data;
}
