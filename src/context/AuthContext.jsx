import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        await authApi.refreshAccessToken();
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(email, password) {
    const loggedInUser = await authApi.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  const value = { user, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
