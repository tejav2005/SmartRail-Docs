import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'kmrl_auth_token';
const AUTH_USER_KEY = 'kmrl_auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(AUTH_USER_KEY),
        ]);

        if (storedToken) {
          setToken(storedToken);
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.warn('Failed to restore auth session', error);
      } finally {
        setBootstrapping(false);
      }
    }

    restoreSession();
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    bootstrapping,
    isAuthenticated: Boolean(token),
    async signIn(session) {
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, session.token),
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user)),
      ]);
      setToken(session.token);
      setUser(session.user);
    },
    async signOut() {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(AUTH_USER_KEY),
      ]);
      setToken(null);
      setUser(null);
    },
  }), [bootstrapping, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
