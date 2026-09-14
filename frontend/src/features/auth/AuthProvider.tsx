import { useCallback, useMemo, useState, type ReactNode } from "react";
import { login as loginRequest } from "@/api/auth.api";
import {
  AuthContext,
  clearSession,
  getSession,
  setSession,
  type Session,
} from "@/features/auth/useAuthStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => getSession());

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await loginRequest(email, password);
    const next: Session = { token, user };
    setSession(next);
    setSessionState(next);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
