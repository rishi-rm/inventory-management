import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'stockly.auth.user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = async ({ email }) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const name = email.split('@')[0].replace(/[._-]/g, ' ');
    setUser({ email, name: name.charAt(0).toUpperCase() + name.slice(1), createdAt: new Date().toISOString() });
    setLoading(false);
  };

  const register = async ({ name, email }) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setUser({ email, name, createdAt: new Date().toISOString() });
    setLoading(false);
  };

  const logout = () => setUser(null);
  const updateProfile = (patch) => setUser((u) => ({ ...u, ...patch }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);