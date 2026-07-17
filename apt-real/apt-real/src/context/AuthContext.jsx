import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

// React Context lets any component read "who is logged in" without
// passing props down through every level of the component tree.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(username, password) {
    const data = await authService.login(username, password);
    // data looks like: { token, id, fullName, username, email, role }
    const loggedInUser = {
      id: data.id,
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      role: data.role, // "ADMIN" or "EMPLOYEE"
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(fullName, username, email, phone, password) {
    return authService.register(fullName, username, email, phone, password);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const isAdmin = user?.role === 'ADMIN';

  const value = { user, loading, login, register, logout, isAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}