import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AUTH_STORAGE_KEY = "auth_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
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
  const hasAnyRole = (list = []) =>
    list.length === 0 ? true : list.some((r) => hasRole(r));

  const login = (payload) => {
    const token = payload?.token ?? payload?.accessToken ?? null;
    const name = payload?.name ?? payload.user?.name ?? null;
    const email = payload?.email ?? payload?.user?.email ?? null;
    const normalizedRoles = Array.from(
      new Set((payload?.roles ?? payload?.user?.roles ?? []).map((r) => String(r).toUpperCase()))
    );
    if (!token) throw new Error("No token in response");
    const next = { token, name, email, roles: normalizedRoles };
    setAuth(next);
    return next;
  };

  const logout = () => {
  // 1. Clear localStorage first
  localStorage.removeItem(AUTH_STORAGE_KEY);

  // 2. Clear React state
  setAuth(null);

  // 3. Navigate
  navigate("/signin", { replace: true });
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
      setAuth,
    }),
    [auth, roles, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Optional helpers (use same key everywhere)
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};

export const setUser = (obj) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(obj));
};

export const clearUser = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
