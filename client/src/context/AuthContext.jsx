import { createContext, useContext, useState } from 'react';

// Temporary mock auth — replace with real JWT login once auth API is built.
// To test admin view: open DevTools → Application → localStorage → set ym-role = admin
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user] = useState(() => {
    const role = localStorage.getItem('ym-role') || 'customer';
    return { role };
  });

  const isAdmin = user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
