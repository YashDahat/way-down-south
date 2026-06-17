import { createContext, useState, useEffect, useMemo } from 'react';
import authService from '../services/authService'; // Changed to AuthService (capital A) - FIX: Reverted to lowercase 'a' assuming file is authService.ts

interface AuthContextType {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setToken(response.token);
      setRole(response.role);
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
    } catch (error) {
      console.error('Login failed:', error);
      setToken(null);
      setRole(null);
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      throw error; // Re-throw the error for UI components to handle
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  const contextValue = useMemo(
    () => ({
      token,
      role,
      isAuthenticated: !!token,
      isLoading,
      login,
      logout,
    }),
    [token, role, isLoading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};