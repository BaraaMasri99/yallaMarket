import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { logoutUser } from '../services/authService';

const STORAGE_KEY = 'ym-auth';

const AuthContext = createContext();

function readStoredAuth() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      token: stored.token || '',
      currentUser: stored.user || null,
    };
  } catch {
    return { token: '', currentUser: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const login = useCallback((data) => {
    const nextAuth = {
      token: data?.token || '',
      currentUser: data?.user || null,
    };

    setAuth(nextAuth);

    if (nextAuth.token || nextAuth.currentUser) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: nextAuth.token, user: nextAuth.currentUser })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearAuth = useCallback(() => {
    setAuth({ token: '', currentUser: null });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser(auth.token);
    } finally {
      clearAuth();
    }
  }, [auth.token, clearAuth]);

  const value = useMemo(
    () => ({
      token: auth.token,
      currentUser: auth.currentUser,
      isAuthenticated: Boolean(auth.token),
      login,
      logout,
      clearAuth,
    }),
    [auth.currentUser, auth.token, clearAuth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
