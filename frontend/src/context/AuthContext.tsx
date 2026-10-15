import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginRequest,
  register as registerRequest,
  refreshAccessToken,
  logout as logoutRequest,
  getCurrentAccount,
} from "../api/auth.api";

import { parseApiError } from "../api/errors";
import { setApiAccessToken, setSessionRefresher } from "../api/client";

import { AuthContext } from "./AuthContext";
import type { AccountProfile, AuthUser } from "../types/auth";

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];

  if (!payload) {
    throw new Error("Invalid access token.");
  }

  const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

  return JSON.parse(decoded) as Record<string, unknown>;
}

function getUserFromToken(token: string): AuthUser {
  const payload = decodeJwtPayload(token);

  if (
    typeof payload.sub !== "string" ||
    typeof payload.sessionId !== "string" ||
    (payload.role !== "ADMIN" &&
      payload.role !== "SUPER_ADMIN" &&
      payload.role !== "ATTENDEE")
  ) {
    throw new Error("Invalid authentication token.");
  }

  return {
    accountId: payload.sub,
    sessionId: payload.sessionId,
    role: payload.role,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * Set when the session could not be CHECKED (429, 5xx, network).
   * That is different from "signed out": the user may well be signed in,
   * so guards must show a retry state instead of "Access restricted".
   */
  const [sessionError, setSessionError] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setApiAccessToken(null);
    setAccessToken(null);
    setUser(null);
    setProfile(null);
  }, []);

  /**
   * Restores an existing authenticated session from the refresh cookie.
   *
   * Only 401/403 mean "there is no valid session".
   * A 429, 5xx, or network failure means the session could not be checked.
   */
  const restoreSession = useCallback(async (): Promise<void> => {
    let token: string;

    try {
      const response = await refreshAccessToken();
      token = response.data.accessToken;
    } catch (err) {
      clearSession();

      const { status, message } = parseApiError(
        err,
        "We couldn't check your session.",
      );

      setSessionError(status === 401 || status === 403 ? null : message);

      setIsInitializing(false);
      return;
    }

    try {
      const authenticatedUser = getUserFromToken(token);

      setApiAccessToken(token);
      setAccessToken(token);
      setUser(authenticatedUser);

      try {
        const profileResponse = await getCurrentAccount();
        setProfile(profileResponse.data);
      } catch {
        setProfile(null);
      }

      setSessionError(null);
    } catch {
      // The server answered but the token is unusable.
      // Treat this as a signed-out state.
      clearSession();
      setSessionError(null);
    }

    setIsInitializing(false);
  }, [clearSession]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void restoreSession();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [restoreSession]);

  const retrySession = useCallback(async (): Promise<void> => {
    setSessionError(null);
    await restoreSession();
  }, [restoreSession]);

  const updateProfile = useCallback((updatedProfile: AccountProfile): void => {
    setProfile(updatedProfile);
  }, []);

  /**
   * Used by the API client's 401 interceptor.
   *
   * Refreshes the session once and returns the new access token.
   * A 401/403 from the refresh endpoint ends the session.
   * A 429, 5xx, or network failure does not.
   */
  const refreshSession = useCallback(async (): Promise<string | null> => {
    try {
      const response = await refreshAccessToken();

      const token = response.data.accessToken;
      const authenticatedUser = getUserFromToken(token);

      setApiAccessToken(token);
      setAccessToken(token);
      setUser(authenticatedUser);

      try {
        const profileResponse = await getCurrentAccount();
        setProfile(profileResponse.data);
      } catch {
        setProfile(null);
      }

      setSessionError(null);

      return token;
    } catch (err) {
      const { status } = parseApiError(err, "Session refresh failed.");

      if (status === 401 || status === 403) {
        clearSession();
      }

      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    setSessionRefresher(refreshSession);

    return () => {
      setSessionRefresher(null);
    };
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const response = await loginRequest({
        email,
        password,
      });

      const token = response.data.accessToken;
      const authenticatedUser = getUserFromToken(token);

      setApiAccessToken(token);
      setAccessToken(token);
      setUser(authenticatedUser);

      const profileResponse = await getCurrentAccount();
      setProfile(profileResponse.data);

      setSessionError(null);

      return authenticatedUser;
    },
    [],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
    ): Promise<void> => {
      const response = await registerRequest({
        email,
        password,
        firstName,
        lastName,
      });

      const token = response.data.accessToken;
      const authenticatedUser = getUserFromToken(token);

      setApiAccessToken(token);
      setAccessToken(token);
      setUser(authenticatedUser);

      const profileResponse = await getCurrentAccount();
      setProfile(profileResponse.data);

      setSessionError(null);
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
      setSessionError(null);
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      profile,
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      sessionError,
      retrySession,
      updateProfile,
      login,
      register,
      logout,
    }),
    [
      accessToken,
      user,
      profile,
      sessionError,
      retrySession,
      updateProfile,
      login,
      register,
      logout,
    ],
  );

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3ED]">
        <div className="text-center">
          <p className="font-serif text-4xl italic text-[#162425]">Solais</p>

          <div className="mx-auto mt-5 h-px w-16 bg-[#C99A5B]" />

          <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-[#162425]/45">
            Preparing your experience
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
