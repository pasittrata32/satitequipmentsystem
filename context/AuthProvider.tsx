import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '../types.ts';
import api from '../services/api.ts';

type AuthContextType = {
  user: User | null;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password?: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await api.login(username, password);
      if (loggedInUser) {
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return true;
      }
      localStorage.removeItem('currentUser');
      setUser(null);
      return false;
    } catch (error) {
      console.error("Login error", error);
      localStorage.removeItem('currentUser');
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};