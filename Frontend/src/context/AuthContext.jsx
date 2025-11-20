import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const AUTH_STORAGE_KEY = "auth_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  const isAuthenticated = !!auth?.token;
  const roles = auth?.roles ?? [];

  const hasRole = (role) => roles.includes(String(role).toUpperCase());

  const hasAnyRole = (list = []) => {
    if (!Array.isArray(list) || list.length === 0) return true;
    return list.some((r) => hasRole(r));
  };

  const login = (payload) => {
    const token = payload?.token ?? payload?.accessToken;
    const name = payload?.name ?? payload?.user?.name ?? null;
    const email = payload?.email ?? payload?.user?.email ?? null;

    const normalizedRoles = Array.from(
      new Set((payload?.roles ?? payload?.user?.roles ?? []).map((r) => r.toUpperCase()))
    );

    const session = { token, name, email, roles: normalizedRoles };
    setAuth(session);

    return session;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  };

  const value = useMemo(
    () => ({
      token: auth?.token ?? null,
      name: auth?.name ?? null,
      email: auth?.email ?? null,
      roles,
      isAuthenticated,
      hasRole,
      hasAnyRole,
      login,
      logout,
    }),
    [auth, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
