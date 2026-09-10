import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('luna_auth');
    setIsAuthenticated(auth === 'true');
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('luna_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('luna_auth', 'true');
      localStorage.setItem('luna_user', email);
      setUserName(user.name || '');
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

  return { isAuthenticated, loading, login, logout, userName };
}