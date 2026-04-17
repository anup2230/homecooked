"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'BUYER' | 'COOK' | 'ADMIN';
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  isCook: boolean;
  isAdmin: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const user = session?.user as AuthUser | null ?? null;
  const isCook = user?.role === 'COOK';
  const isAdmin = user?.role === 'ADMIN';

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: 'Invalid email or password' };
    }

    router.push('/discover');
    return {};
  };

  const logout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, isCook, isAdmin, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
