import { createContext } from "react";

import type { AccountProfile, AuthUser } from "../types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  profile: AccountProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  sessionError: string | null;
  retrySession: () => Promise<void>;
  updateProfile: (profile: AccountProfile) => void;

  login: (email: string, password: string) => Promise<AuthUser>;

  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
