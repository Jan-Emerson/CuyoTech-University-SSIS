import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser } from '../api/api.js';

const AuthContext = createContext(null);

function loadUser() {
  try {
    const raw = localStorage.getItem('ssis_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('ssis_user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const login = useCallback(async (username, password) => {
    const userData = await loginUser(username, password);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ssis_user');
    setUser(null);
  }, []);

  // helper booleans
  const isStudent  = user?.role === 'student';
  const isRegistrar= user?.role === 'registrar';
  const isCashier  = user?.role === 'cashier';
  const isDeptStaff= user?.role === 'dept_staff';
  const isAdmin    = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isStudent, isRegistrar, isCashier, isDeptStaff, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
