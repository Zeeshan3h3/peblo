import { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('peblo_token');
    const storedUser = localStorage.getItem('peblo_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const { token, user } = res.data;
    
    localStorage.setItem('peblo_token', token);
    localStorage.setItem('peblo_user', JSON.stringify(user));
    
    setToken(token);
    setUser(user);
    
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await axiosInstance.post('/auth/signup', { name, email, password });
    const { token, user } = res.data;
    
    localStorage.setItem('peblo_token', token);
    localStorage.setItem('peblo_user', JSON.stringify(user));
    
    setToken(token);
    setUser(user);
    
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('peblo_token');
    localStorage.removeItem('peblo_user');
    
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
