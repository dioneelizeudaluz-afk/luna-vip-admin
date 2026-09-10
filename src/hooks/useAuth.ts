import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('luna_auth');
    setIsAuthenticated(auth === 'true');
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    if (email === 'admin@luna.com' && password === 'admin123') {
      localStorage.setItem('luna_auth', 'true');
      localStorage.setItem('luna_user', email);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('luna_auth');
    localStorage.removeItem('luna_user');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, loading, login, logout };
}