import type { UserRole } from "./auth";

export interface Account {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerifiedAt: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountResponse {
  success: boolean;
  message: string;
  data: Account;
}
