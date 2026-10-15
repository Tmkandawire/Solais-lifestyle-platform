export type UserRole = "ADMIN" | "SUPER_ADMIN" | "ATTENDEE";

export interface AuthUser {
  accountId: string;
  sessionId: string;
  role: UserRole;
}

export interface AccountProfile {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}
