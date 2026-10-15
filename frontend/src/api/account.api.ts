import { apiClient } from "./client";

import type { AccountResponse } from "../types/account";

export async function getCurrentAccount(): Promise<AccountResponse> {
  const response = await apiClient.get<AccountResponse>("/account/me");

  return response.data;
}

export interface UpdateAccountProfilePayload {
  firstName: string;
  lastName: string;
}

export async function updateAccountProfile(
  payload: UpdateAccountProfilePayload,
): Promise<AccountResponse> {
  const response = await apiClient.patch<AccountResponse>(
    "/account/me",
    payload,
  );
  return response.data;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await apiClient.patch("/account/password", payload);
}

export type ThemePreference = "LIGHT" | "DARK";

export interface AccountThemePreferenceResponse {
  success: boolean;
  message: string;
  data: {
    theme: ThemePreference;
  };
}

export async function getAccountThemePreference(): Promise<{
  theme: ThemePreference;
}> {
  const response = await apiClient.get<AccountThemePreferenceResponse>(
    "/account/preferences",
  );

  return response.data.data;
}

export async function updateAccountThemePreference(
  theme: ThemePreference,
): Promise<{ theme: ThemePreference }> {
  const response = await apiClient.patch<AccountThemePreferenceResponse>(
    "/account/preferences",
    { theme },
  );

  return response.data.data;
}
