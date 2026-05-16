'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  signInWithEmail,
  saveSession,
  loadSession,
  clearSession,
  getValidToken,
} from '@/lib/firebaseAuth';

interface AdminAuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => Promise<string>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = loadSession();
    setUser(session);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const authUser = await signInWithEmail(email, password);
    saveSession(authUser);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const getToken = useCallback(async (): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const { token, user: refreshed } = await getValidToken(user);
    if (refreshed !== user) setUser(refreshed);
    return token;
  }, [user]);

  return (
    <AdminAuthContext.Provider value={{ user, loading, login, logout, getToken }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}
