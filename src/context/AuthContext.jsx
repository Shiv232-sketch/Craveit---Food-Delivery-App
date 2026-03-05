import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('craveit_token') || null);
  const [loading, setLoading] = useState(true);

  // On app load, verify token and fetch user
  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('craveit_token');
      if (savedToken) {
        try {
          const res = await fetch(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            setToken(savedToken);
          } else {
            logout();
          }
        } catch {
          // Backend not connected — load from localStorage for demo
          const savedUser = localStorage.getItem('craveit_user');
          if (savedUser) setUser(JSON.parse(savedUser));
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const register = async (name, email, password, phone) => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('craveit_token', data.token);
        localStorage.setItem('craveit_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      // Demo mode — simulate registration
      const demoUser = { id: Date.now(), name, email, role: 'customer' };
      setUser(demoUser);
      setToken('demo_token');
      localStorage.setItem('craveit_token', 'demo_token');
      localStorage.setItem('craveit_user', JSON.stringify(demoUser));
      return { success: true };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('craveit_token', data.token);
        localStorage.setItem('craveit_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch {
      // Demo mode — simulate login
      const demoUser = { id: Date.now(), name: email.split('@')[0], email, role: 'customer' };
      setUser(demoUser);
      setToken('demo_token');
      localStorage.setItem('craveit_token', 'demo_token');
      localStorage.setItem('craveit_user', JSON.stringify(demoUser));
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('craveit_token');
    localStorage.removeItem('craveit_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
