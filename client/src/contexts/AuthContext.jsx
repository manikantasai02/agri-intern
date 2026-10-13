// client/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agriconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agriconnect_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      authAPI.getMe()
        .then(res => {
          if (res.data && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('agriconnect_user', JSON.stringify(res.data.data));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('agriconnect_token', receivedToken);
      localStorage.setItem('agriconnect_user', JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check credentials.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(userData);
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('agriconnect_token', receivedToken);
      localStorage.setItem('agriconnect_user', JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please check inputs.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agriconnect_token');
    localStorage.removeItem('agriconnect_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
